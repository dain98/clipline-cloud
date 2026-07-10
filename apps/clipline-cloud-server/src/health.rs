use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use axum::{extract::State, http::StatusCode, Json};
use clipline_cloud_api_types::{HealthResponse, ReadinessResponse};
use tokio::sync::Mutex;
use tracing::warn;

use crate::AppState;

const READINESS_CACHE_TTL: Duration = Duration::from_secs(5);

#[derive(Clone, Default)]
pub(crate) struct ReadinessCache {
    value: Arc<Mutex<Option<CachedReadiness>>>,
}

#[derive(Clone, Copy)]
struct CachedReadiness {
    checked_at: Instant,
    database_status: &'static str,
    storage_status: &'static str,
}

pub(crate) async fn healthz() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

pub(crate) async fn readyz(State(state): State<AppState>) -> (StatusCode, Json<ReadinessResponse>) {
    let mut cached = state.readiness.value.lock().await;
    if let Some(value) = *cached {
        if value.checked_at.elapsed() < READINESS_CACHE_TTL {
            let ready = value.database_status == "ok" && value.storage_status == "ok";
            return readiness_response(value.database_status, value.storage_status, ready);
        }
    }

    let database_status = match state.database.ping().await {
        Ok(()) => "ok",
        Err(error) => {
            warn!(event = "database.readyz_failed", error = %error);
            "error"
        }
    };
    let storage_status = match state.storage.probe().await {
        Ok(()) => "ok",
        Err(error) => {
            warn!(event = "storage.readyz_failed", error = %error);
            "error"
        }
    };
    *cached = Some(CachedReadiness {
        checked_at: Instant::now(),
        database_status,
        storage_status,
    });
    let ready = database_status == "ok" && storage_status == "ok";

    readiness_response(database_status, storage_status, ready)
}

pub(crate) fn readiness_response(
    database_status: &'static str,
    storage_status: &'static str,
    ready: bool,
) -> (StatusCode, Json<ReadinessResponse>) {
    (
        if ready {
            StatusCode::OK
        } else {
            StatusCode::SERVICE_UNAVAILABLE
        },
        Json(ReadinessResponse {
            status: if ready { "ok" } else { "not_ready" },
            database: database_status,
            storage: storage_status,
        }),
    )
}
