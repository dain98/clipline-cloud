use std::time::Duration;

use axum::{
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use clipline_cloud_api_types::ErrorResponse;
use tracing::warn;

#[derive(Debug)]
pub(crate) struct ApiError {
    status: StatusCode,
    message: String,
    retry_after: Option<Duration>,
}

impl ApiError {
    fn new(status: StatusCode, message: impl Into<String>) -> Self {
        Self {
            status,
            message: message.into(),
            retry_after: None,
        }
    }

    fn with_retry_after(mut self, retry_after: Duration) -> Self {
        self.retry_after = Some(retry_after);
        self
    }

    pub(crate) fn message(&self) -> &str {
        &self.message
    }

    pub(crate) fn status(&self) -> StatusCode {
        self.status
    }

    pub(crate) fn bad_request(message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, message)
    }

    pub(crate) fn unauthorized(message: impl Into<String>) -> Self {
        Self::new(StatusCode::UNAUTHORIZED, message)
    }

    pub(crate) fn forbidden(message: impl Into<String>) -> Self {
        Self::new(StatusCode::FORBIDDEN, message)
    }

    pub(crate) fn not_found(message: impl Into<String>) -> Self {
        Self::new(StatusCode::NOT_FOUND, message)
    }

    pub(crate) fn conflict(message: impl Into<String>) -> Self {
        Self::new(StatusCode::CONFLICT, message)
    }

    pub(crate) fn payload_too_large(message: impl Into<String>) -> Self {
        Self::new(StatusCode::PAYLOAD_TOO_LARGE, message)
    }

    pub(crate) fn too_many_requests(message: impl Into<String>) -> Self {
        Self::new(StatusCode::TOO_MANY_REQUESTS, message)
    }

    pub(crate) fn too_many_requests_after(
        message: impl Into<String>,
        retry_after: Duration,
    ) -> Self {
        Self::too_many_requests(message).with_retry_after(retry_after)
    }

    pub(crate) fn service_unavailable_after(
        message: impl Into<String>,
        retry_after: Duration,
    ) -> Self {
        Self::new(StatusCode::SERVICE_UNAVAILABLE, message).with_retry_after(retry_after)
    }

    pub(crate) fn internal(message: impl Into<String>) -> Self {
        let message = message.into();
        warn!(event = "api.internal_error", detail = %message);
        Self::new(StatusCode::INTERNAL_SERVER_ERROR, message)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let public_message = if self.status == StatusCode::INTERNAL_SERVER_ERROR {
            "internal server error".to_string()
        } else {
            self.message
        };
        let mut response = (
            self.status,
            Json(ErrorResponse {
                error: public_message,
            }),
        )
            .into_response();

        if let Some(retry_after) = self.retry_after {
            let seconds = retry_after.as_secs().max(1).to_string();
            if let Ok(value) = HeaderValue::from_str(&seconds) {
                response.headers_mut().insert(header::RETRY_AFTER, value);
            }
        }

        response
    }
}

impl From<clipline_cloud_db::DbError> for ApiError {
    fn from(value: clipline_cloud_db::DbError) -> Self {
        warn!(event = "api.db_error", error = %value);
        Self::new(StatusCode::INTERNAL_SERVER_ERROR, "database error")
    }
}

#[cfg(test)]
mod tests {
    use axum::body::to_bytes;

    use super::*;

    #[tokio::test]
    async fn internal_diagnostics_are_not_exposed_to_clients() {
        let error = ApiError::internal("password worker failed: sensitive diagnostic");
        assert_eq!(
            error.message(),
            "password worker failed: sensitive diagnostic"
        );

        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
        let body = to_bytes(response.into_body(), 1024).await.expect("body");
        let body: ErrorResponse = serde_json::from_slice(&body).expect("JSON body");
        assert_eq!(body.error, "internal server error");
    }
}
