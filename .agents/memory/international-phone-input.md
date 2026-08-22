---
name: International phone input
description: Shared phone fields use a normalized international value and require wrapper-specific styling.
---

The shared phone field uses `react-phone-number-input` with the complete country list and returns E.164-style values. Its `className` styles the outer wrapper, so input styling belongs under `.PhoneInputInput`; unsupported top-level props can leak to the native input and trigger warnings.

**Why:** The library's default layout conflicts with OFOQ's form styling, and passing unsupported props caused browser warnings.

**How to apply:** Keep country selection and formatting centralized in the shared component, preserve `defaultCountry="SA"`, and style light/dark variants through the wrapper classes.