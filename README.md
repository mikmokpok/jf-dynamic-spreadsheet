# jf-dynamic-spreadsheet

A modiication of Jotform's Spreadsheet to Form widget. It can be used to prepopulate form fields with data from Google Sheets based on an access code. Please refer to the guide on the original Spreadsheet to Form widget at https://www.jotform.com/help/442-how-to-use-the-spreadsheet-to-form-widget/ to learn how to set up the source sheet. Note that due to the Google API's limitation, the Sheet must be public.

Demo form: https://www.jotform.com/220765800532956

Jotform parameter setup:<br>
sURL - Text <br>
apiKey - Text<br>
sheetName - Text<br>
codeColumn -Text<br>
labelsRow - Text<br>
fillBtnTex - Text<br>
loadingText - Text<br>
validCodeTxt - Text<br>
invalidCodeTxt - Text<br>
submitInput - Dropdown (No, Yes)<br>
autofillByCondition - Dropdown (No, Yes)<br>
resetInvalid - Radio (Yes, No)<br>
hide - Dropdown (No, Yes)<br>
