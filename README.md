# jf-dynamic-spreadsheet

Jotform widget that is a modiication of the Spreadsheet to Form widget. It can be used to prepopulate form fields with data held in Google Sheets based on an access code. Please refer to the guide on the original Spreadsheet to Form widget at https://www.jotform.com/help/442-how-to-use-the-spreadsheet-to-form-widget/ to learn how to set up the source sheet. Note that due to the Google API's limitation, the Sheet must be public.

Demo form: https://www.jotform.com/220765800532956

Jotform parameter setup:
sURL - Text
apiKey - Text
sheetName - Text
codeColumn -Text
labelsRow - Text
fillBtnTex - Text
loadingText - Text
validCodeTxt - Text
invalidCodeTxt - Text
submitInput - Dropdown (No, Yes)
autofillByCondition - Dropdown (No, Yes)
resetInvalid - Radio (Yes, No)
hide - Dropdown (No, Yes)
