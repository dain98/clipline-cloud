use crate::error::ApiError;

/// Trims a user-provided optional string and treats blank input as absent.
pub(crate) fn normalized_optional(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

/// Borrowed variant of [`normalized_optional`] for request fields that must be
/// retained after validation.
pub(crate) fn normalized_optional_ref(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

pub(crate) fn validate_optional_char_count(
    value: Option<&str>,
    field: &str,
    max_chars: usize,
) -> Result<(), ApiError> {
    if value.is_some_and(|value| value.trim().chars().count() > max_chars) {
        return Err(ApiError::bad_request(format!(
            "{field} must be {max_chars} characters or fewer"
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn optional_strings_are_trimmed_and_blanks_are_absent() {
        assert_eq!(
            normalized_optional(Some(" value ".into())).as_deref(),
            Some("value")
        );
        assert_eq!(normalized_optional(Some("  ".into())), None);
        assert_eq!(normalized_optional(None), None);
    }

    #[test]
    fn character_limit_counts_characters_instead_of_utf8_bytes() {
        assert!(validate_optional_char_count(Some("éé"), "field", 2).is_ok());
        let error = validate_optional_char_count(Some("ééé"), "field", 2).unwrap_err();
        assert_eq!(error.message(), "field must be 2 characters or fewer");
    }
}
