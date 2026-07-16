use std::{str::FromStr, time::Duration};

use bytes::Bytes;
use reqwest::{header, Client, StatusCode};
use serde::{Deserialize, Serialize};
use url::Url;

use crate::{config::Config, error::ApiError};

const API_BASE_URL: &str = "https://www.steamgriddb.com/api/v2/";
const REQUEST_TIMEOUT: Duration = Duration::from_secs(12);
const MAX_ARTWORK_RESULTS: usize = 30;
const MAX_IMAGE_BYTES: usize = 10 * 1024 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub(crate) struct GameSearchResult {
    pub(crate) id: i64,
    pub(crate) name: String,
    #[serde(default)]
    pub(crate) types: Vec<String>,
    #[serde(default)]
    pub(crate) verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub(crate) struct ArtworkResult {
    pub(crate) id: i64,
    pub(crate) kind: String,
    pub(crate) score: i64,
    pub(crate) style: String,
    pub(crate) url: String,
    pub(crate) thumb: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ArtworkKind {
    Grid,
    Hero,
    Logo,
    Icon,
}

impl ArtworkKind {
    pub(crate) fn as_str(self) -> &'static str {
        match self {
            Self::Grid => "grid",
            Self::Hero => "hero",
            Self::Logo => "logo",
            Self::Icon => "icon",
        }
    }

    fn endpoint(self) -> &'static str {
        match self {
            Self::Grid => "grids",
            Self::Hero => "heroes",
            Self::Logo => "logos",
            Self::Icon => "icons",
        }
    }
}

impl FromStr for ArtworkKind {
    type Err = ApiError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "grid" => Ok(Self::Grid),
            "hero" => Ok(Self::Hero),
            "logo" => Ok(Self::Logo),
            "icon" => Ok(Self::Icon),
            _ => Err(ApiError::bad_request(
                "artwork kind must be grid, hero, logo, or icon",
            )),
        }
    }
}

pub(crate) struct ImageAsset {
    pub(crate) bytes: Bytes,
    pub(crate) content_type: String,
}

#[derive(Debug, Deserialize)]
struct SearchResponse {
    data: Vec<GameSearchResult>,
}

#[derive(Debug, Deserialize)]
struct ArtworkResponse {
    data: Vec<RawArtworkResult>,
}

#[derive(Debug, Deserialize)]
struct RawArtworkResult {
    id: i64,
    #[serde(default)]
    score: i64,
    #[serde(default)]
    style: String,
    url: String,
    thumb: String,
}

pub(crate) fn configured(config: &Config) -> bool {
    config
        .steamgriddb_api_key
        .as_deref()
        .is_some_and(|key| !key.trim().is_empty())
}

pub(crate) async fn search_games(
    config: &Config,
    term: &str,
) -> Result<Vec<GameSearchResult>, ApiError> {
    let term = term.trim();
    if !(2..=100).contains(&term.chars().count()) {
        return Err(ApiError::bad_request(
            "SteamGridDB search must be between 2 and 100 characters",
        ));
    }
    let url = api_url(&["search", "autocomplete", term])?;
    let response: SearchResponse = authenticated_get(config, url).await?;
    Ok(response.data.into_iter().take(20).collect())
}

pub(crate) async fn list_artwork(
    config: &Config,
    game_id: i64,
    kind: ArtworkKind,
) -> Result<Vec<ArtworkResult>, ApiError> {
    if game_id <= 0 {
        return Err(ApiError::bad_request(
            "SteamGridDB game id must be positive",
        ));
    }
    let mut url = api_url(&[kind.endpoint(), "game", &game_id.to_string()])?;
    {
        let mut query = url.query_pairs_mut();
        query.append_pair("types", "static");
        query.append_pair("nsfw", "false");
        query.append_pair("humor", "false");
        query.append_pair("epilepsy", "false");
        query.append_pair("limit", &MAX_ARTWORK_RESULTS.to_string());
        if kind == ArtworkKind::Icon {
            query.append_pair("mimes", "image/png");
        }
    }
    let response: ArtworkResponse = authenticated_get(config, url).await?;
    Ok(response
        .data
        .into_iter()
        .filter(|asset| valid_artwork_url(&asset.url) && valid_artwork_url(&asset.thumb))
        .take(MAX_ARTWORK_RESULTS)
        .map(|asset| ArtworkResult {
            id: asset.id,
            kind: kind.as_str().to_string(),
            score: asset.score,
            style: asset.style,
            url: asset.url,
            thumb: asset.thumb,
        })
        .collect())
}

pub(crate) fn best_game_match(
    term: &str,
    results: Vec<GameSearchResult>,
) -> Option<GameSearchResult> {
    let normalized_term = normalized_game_title(term);
    if let Some(exact) = results
        .iter()
        .find(|game| normalized_game_title(&game.name) == normalized_term)
    {
        return Some(exact.clone());
    }
    results.into_iter().find(|game| {
        let candidate = normalized_game_title(&game.name);
        game.verified && candidate.chars().count() >= 3 && normalized_term.starts_with(&candidate)
    })
}

pub(crate) fn highest_scoring_artwork(results: Vec<ArtworkResult>) -> Option<ArtworkResult> {
    results.into_iter().max_by(|left, right| {
        left.score
            .cmp(&right.score)
            .then_with(|| right.id.cmp(&left.id))
    })
}

fn normalized_game_title(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

pub(crate) async fn fetch_image(url: &str) -> Result<ImageAsset, ApiError> {
    if !valid_artwork_url(url) {
        return Err(ApiError::bad_request("invalid SteamGridDB artwork URL"));
    }
    let response = http_client()?
        .get(url)
        .send()
        .await
        .map_err(|_| ApiError::bad_gateway("SteamGridDB artwork could not be loaded"))?;
    if !response.status().is_success() {
        return Err(ApiError::bad_gateway(
            "SteamGridDB artwork could not be loaded",
        ));
    }
    if response
        .content_length()
        .is_some_and(|length| length > MAX_IMAGE_BYTES as u64)
    {
        return Err(ApiError::payload_too_large(
            "SteamGridDB artwork is too large",
        ));
    }
    let content_type = response
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .filter(|value| value.starts_with("image/"))
        .ok_or_else(|| ApiError::bad_gateway("SteamGridDB returned non-image artwork"))?
        .to_string();
    let bytes = response
        .bytes()
        .await
        .map_err(|_| ApiError::bad_gateway("SteamGridDB artwork could not be loaded"))?;
    if bytes.len() > MAX_IMAGE_BYTES {
        return Err(ApiError::payload_too_large(
            "SteamGridDB artwork is too large",
        ));
    }
    Ok(ImageAsset {
        bytes,
        content_type,
    })
}

async fn authenticated_get<T: for<'de> Deserialize<'de>>(
    config: &Config,
    url: Url,
) -> Result<T, ApiError> {
    let api_key = config
        .steamgriddb_api_key
        .as_deref()
        .map(str::trim)
        .filter(|key| !key.is_empty())
        .ok_or_else(|| ApiError::service_unavailable("SteamGridDB is not configured"))?;
    let response = http_client()?
        .get(url)
        .bearer_auth(api_key)
        .send()
        .await
        .map_err(|_| ApiError::bad_gateway("SteamGridDB request failed"))?;
    match response.status() {
        status if status.is_success() => response
            .json::<T>()
            .await
            .map_err(|_| ApiError::bad_gateway("SteamGridDB returned an invalid response")),
        StatusCode::UNAUTHORIZED => Err(ApiError::bad_gateway(
            "SteamGridDB rejected the configured API key",
        )),
        StatusCode::TOO_MANY_REQUESTS => {
            let retry_after = response
                .headers()
                .get(header::RETRY_AFTER)
                .and_then(|value| value.to_str().ok())
                .and_then(|value| value.parse::<u64>().ok())
                .unwrap_or(30)
                .clamp(1, 300);
            Err(ApiError::too_many_requests_after(
                "SteamGridDB rate limit reached",
                Duration::from_secs(retry_after),
            ))
        }
        StatusCode::NOT_FOUND => Ok(serde_json::from_value(serde_json::json!({ "data": [] }))
            .map_err(|_| ApiError::internal("empty SteamGridDB response could not be decoded"))?),
        _ => Err(ApiError::bad_gateway("SteamGridDB request failed")),
    }
}

fn api_url(segments: &[&str]) -> Result<Url, ApiError> {
    let mut url = Url::parse(API_BASE_URL)
        .map_err(|_| ApiError::internal("SteamGridDB API URL is invalid"))?;
    url.path_segments_mut()
        .map_err(|_| ApiError::internal("SteamGridDB API URL cannot contain path segments"))?
        .pop_if_empty()
        .extend(segments.iter().copied());
    Ok(url)
}

fn http_client() -> Result<Client, ApiError> {
    Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .redirect(reqwest::redirect::Policy::none())
        .user_agent(concat!("clipline-cloud/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|_| ApiError::internal("HTTP client could not be initialized"))
}

fn valid_artwork_url(value: &str) -> bool {
    let Ok(url) = Url::parse(value) else {
        return false;
    };
    if url.scheme() != "https" {
        return false;
    }
    url.host_str().is_some_and(|host| {
        let host = host.to_ascii_lowercase();
        host == "steamgriddb.com" || host.ends_with(".steamgriddb.com")
    })
}

#[cfg(test)]
mod tests {
    use axum::{
        http::{header as axum_header, HeaderValue},
        response::IntoResponse,
    };

    use super::*;

    #[test]
    fn artwork_kind_accepts_supported_asset_families() {
        assert_eq!(ArtworkKind::from_str("grid").unwrap(), ArtworkKind::Grid);
        assert_eq!(ArtworkKind::from_str("hero").unwrap(), ArtworkKind::Hero);
        assert_eq!(ArtworkKind::from_str("logo").unwrap(), ArtworkKind::Logo);
        assert_eq!(ArtworkKind::from_str("icon").unwrap(), ArtworkKind::Icon);
        assert!(ArtworkKind::from_str("avatar").is_err());
    }

    #[test]
    fn artwork_urls_are_restricted_to_steamgriddb_https_hosts() {
        assert!(valid_artwork_url(
            "https://cdn2.steamgriddb.com/thumb/abc.png"
        ));
        assert!(!valid_artwork_url("http://cdn2.steamgriddb.com/abc.png"));
        assert!(!valid_artwork_url(
            "https://steamgriddb.com.example/abc.png"
        ));
        assert!(!valid_artwork_url("https://example.com/abc.png"));
    }

    #[test]
    fn api_urls_preserve_the_versioned_base_path() {
        assert_eq!(
            api_url(&["search", "autocomplete", "Minecraft"])
                .expect("search URL")
                .as_str(),
            "https://www.steamgriddb.com/api/v2/search/autocomplete/Minecraft"
        );
    }

    #[test]
    fn best_game_match_prefers_exact_titles_and_conservative_verified_prefixes() {
        let results = vec![
            GameSearchResult {
                id: 1,
                name: "Minecraft Dungeons".to_string(),
                types: Vec::new(),
                verified: true,
            },
            GameSearchResult {
                id: 2,
                name: "Mine craft".to_string(),
                types: Vec::new(),
                verified: false,
            },
        ];
        assert_eq!(best_game_match("Minecraft", results).unwrap().id, 2);

        let results = vec![
            GameSearchResult {
                id: 3,
                name: "Minecraft Story Mode".to_string(),
                types: Vec::new(),
                verified: true,
            },
            GameSearchResult {
                id: 4,
                name: "Minecraft".to_string(),
                types: Vec::new(),
                verified: true,
            },
        ];
        assert_eq!(best_game_match("Minecraft.Windows", results).unwrap().id, 4);

        let unrelated = vec![GameSearchResult {
            id: 5,
            name: "GTA Wallpaper Collection".to_string(),
            types: Vec::new(),
            verified: true,
        }];
        assert!(best_game_match("GTA 5", unrelated).is_none());
    }

    #[test]
    fn highest_scoring_artwork_uses_score_with_a_stable_id_tiebreaker() {
        let artwork = |id, score| ArtworkResult {
            id,
            kind: "grid".to_string(),
            score,
            style: String::new(),
            url: format!("https://cdn2.steamgriddb.com/{id}.png"),
            thumb: format!("https://cdn2.steamgriddb.com/{id}-thumb.png"),
        };
        let selected = highest_scoring_artwork(vec![artwork(9, 10), artwork(7, 10), artwork(5, 2)])
            .expect("highest scoring artwork");
        assert_eq!(selected.id, 7);
    }

    #[tokio::test]
    async fn http_client_does_not_follow_redirects() {
        use axum::{
            response::Redirect,
            routing::{get, Router},
        };

        let app = Router::new()
            .route("/start", get(|| async { Redirect::temporary("/end") }))
            .route("/end", get(|| async { "followed" }));
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind redirect test server");
        let address = listener.local_addr().expect("redirect test address");
        tokio::spawn(async move { axum::serve(listener, app).await });

        let response = http_client()
            .expect("SteamGridDB client")
            .get(format!("http://{address}/start"))
            .send()
            .await
            .expect("redirect response");

        assert_eq!(response.status(), StatusCode::TEMPORARY_REDIRECT);
    }

    #[tokio::test]
    async fn authenticated_get_maps_upstream_responses() {
        use axum::{routing::get, Json, Router};

        let app = Router::new()
            .route(
                "/success",
                get(|| async {
                    Json(serde_json::json!({
                        "data": [{"id": 15, "name": "Factorio", "verified": true}]
                    }))
                }),
            )
            .route("/unauthorized", get(|| async { StatusCode::UNAUTHORIZED }))
            .route(
                "/limited",
                get(|| async {
                    let mut response = StatusCode::TOO_MANY_REQUESTS.into_response();
                    response
                        .headers_mut()
                        .insert(axum_header::RETRY_AFTER, HeaderValue::from_static("999"));
                    response
                }),
            )
            .route("/missing", get(|| async { StatusCode::NOT_FOUND }))
            .route("/invalid", get(|| async { "not json" }));
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind upstream test server");
        let address = listener.local_addr().expect("upstream test address");
        tokio::spawn(async move { axum::serve(listener, app).await });

        let mut config = Config::for_tests(
            "sqlite:///tmp/clipline-steamgriddb-test.db",
            std::env::temp_dir(),
        );
        config.steamgriddb_api_key = Some("test-key".to_string());
        let url = |path: &str| Url::parse(&format!("http://{address}{path}")).expect("test URL");

        let success: SearchResponse = authenticated_get(&config, url("/success"))
            .await
            .expect("successful upstream response");
        assert_eq!(success.data[0].name, "Factorio");

        let missing: SearchResponse = authenticated_get(&config, url("/missing"))
            .await
            .expect("missing search is empty");
        assert!(missing.data.is_empty());

        let unauthorized = authenticated_get::<SearchResponse>(&config, url("/unauthorized"))
            .await
            .expect_err("unauthorized upstream response");
        assert_eq!(unauthorized.status(), StatusCode::BAD_GATEWAY);
        assert!(unauthorized.message().contains("configured API key"));

        let invalid = authenticated_get::<SearchResponse>(&config, url("/invalid"))
            .await
            .expect_err("invalid upstream response");
        assert_eq!(invalid.status(), StatusCode::BAD_GATEWAY);

        let limited = authenticated_get::<SearchResponse>(&config, url("/limited"))
            .await
            .expect_err("rate-limited upstream response")
            .into_response();
        assert_eq!(limited.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(limited.headers()[axum_header::RETRY_AFTER], "300");
    }

    #[tokio::test]
    async fn authenticated_get_requires_configuration_before_network_access() {
        let config = Config::for_tests(
            "sqlite:///tmp/clipline-steamgriddb-test.db",
            std::env::temp_dir(),
        );
        let error = authenticated_get::<SearchResponse>(
            &config,
            Url::parse("http://127.0.0.1:1/not-called").expect("test URL"),
        )
        .await
        .expect_err("missing configuration");
        assert_eq!(error.status(), StatusCode::SERVICE_UNAVAILABLE);
    }
}
