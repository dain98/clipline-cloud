use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init(level: &str) -> anyhow::Result<()> {
    let filter = EnvFilter::try_new(level)?;

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer().json())
        .try_init()?;

    Ok(())
}
