JFCustomWidgetUtils.domReady(function() {
  function ExcelAutoFill(data) {
    var cdnurl = 'https://www.jotform.com/';
    var params = JFCustomWidget.getWidgetSettings();
    var accessCodeEl = document.getElementById('access-code');
    var autofillBtn = document.getElementById('autofill');
    var messageEl = document.getElementById('message');
    var code = '';
    var fields = [];
    var letterToNumber = changeLetterToNumber(params.codeColumn);
    var includeInputValue = ('submitInput' in params && params.submitInput === 'Yes') || JFCustomWidget.isWidgetRequired();
    var timer = null;
    var populatedValue = null; // populate event, comes from another field through the conditions
    var isEnterprise = Boolean(data.enterprise);
    var autofillByCondition = ('autofillByCondition' in params) && params.autofillByCondition === 'Yes';
    
    // exposed functions
    this.init = init;
    this.getData = getData;
    this.resizeWidget = resizeWidget;
    this.fillAccessCode = fillAccessCode;
    this.resetAccessCode = resetAccessCode;

    /**
     * Widget initialization
     */
    function init() {
      // hide the widget if set
      if ('hide' in params && params.hide === 'Yes') {
        JFCustomWidget.hideWidgetContainer();
      }
      // change button text if set
      autofillBtn.innerHTML = params.fillBtnText || 'Auto Complete Fields';

      addEventListener(accessCodeEl, 'input', function() {
        if (accessCodeEl.value.length === 0) {
          document.getElementById('message').innerHTML = "";
          document.getElementById('message').style.background = "";
        }
      });

      // listen to keypress(Enter) event on the input
      addEventListener(accessCodeEl, 'keypress', function(e) {
        if (e.keyCode === 13) {
          autofillBtn.click();
        }
      })

      // listen to click event on the button
      addEventListener(autofillBtn, 'click', function() {
        code = accessCodeEl.value.trim();
        // if (!params.excel) {
        //   updateStatusMessage('invalid', 'No uploaded spreadsheet file.');
        //   return false;
        // }
        // if (code === '') {
        //   updateStatusMessage('invalid', params.invalidCodeTxt || 'Unknown access code.');
        //   return false;
        // }
        // updateStatusMessage('loading', getLoadingText());

        // get data from backend
        Ajax({
            url: 'https://shots.jotform.com/Michal_S/dynamicstf/spreadsheet.php',
            parameters: {
              action: 'getData',
              url: params.sURL,
              apiKey: params.apiKey,
              sheetName: params.sheetName,
              labelsRow: params.labelsRow || 1,
              codeColumn: letterToNumber,
              code: code,
              formID: data.formID
            },
            success: function(http) {
              if (http.responseText.length === 0) {
                console.error('Error occured. Server has no response.');
                return false;
              }
              var res = JSON.parse(http.responseText);
              var response = res.values;
              // handle errors
              if (!response.success && response.hasOwnProperty('error')) {
                console.error(response.error);
                updateStatusMessage('invalid', getInvalidCodeText());
                handleResetInvalidCode();
                code = '';
                return false;
              }

              // build fields to set
              var result = response[params.labelsRow-1];
              var length = result.length;
              var arrSize = response.length;
              // reset fields and assign new value
              fields = [];
              var row = getAccessRow(arrSize, response, code, letterToNumber-1);
              if(row===0){
                updateStatusMessage('invalid', getInvalidCodeText());
              }else{
              for(var i=0; i<length; i++){
                fields.push({
                    label: result[i],
                    value: getAccessRow(arrSize, response, code, letterToNumber-1)[i]
                });
              }
              updateStatusMessage('valid', getValidCodeText());
            }

              JFCustomWidget.hideWidgetError();
              JFCustomWidget.setFieldsValueByLabel(fields);
              
              // send entered valid code to JotForm
              // if user wants to include it
              if (includeInputValue) {
                JFCustomWidget.sendData(getData());
              }
            },
            error: function(errors) {
              console.error(errors);
              updateStatusMessage('invalid', errors.message || getInvalidCodeText());
              handleResetInvalidCode();
            }
          });

      });

      // if there's a previous code, put it on the field
      if (data && data.value) {
        accessCodeEl.value = data.value;
        code = data.value;
      }

      // resize widget
      resizeWidget();
    }


    function getAccessRow(n, arr, code, codeColumn){
          for(var i=0; i<n; i++){
            if(arr[i][codeColumn]==code){
              return arr[i];
            }
          }
          return 0;
    }

    /**
     * Handle reset of fields when invalid code
     */

    function handleResetInvalidCode() {
      JFCustomWidget.sendData({
        value: ''
      });
      
      // reset known fields if errored
      if ('resetInvalid' in params && params.resetInvalid === 'Yes') {
        // only reset if fields aren't empty
        if (fields.length > 0) {
          var res = fields.filter(function (f) {
              return !!f.label;
          }).map(function (f) {
            return f.label;
          });
          // reset fields
          JFCustomWidget.clearFields(res);
          fields = [];
        }
      }
    }

    /**
     * Update status message
     */
    function updateStatusMessage(status, message) {
      switch (status) {
        case 'valid':
          image = 'accept.png';
          break;
        case 'invalid':
        case 'error':
          image = 'delete.png';
          break;
        case 'loading':
          image = 'loader.gif';
          break;
      }

      messageEl.style.background = 'url("' + cdnurl + 'images/' + image + '") no-repeat left center';
      messageEl.style.display = 'block';
      messageEl.innerHTML = message;

      // resize widget
      resizeWidget();
    }

    function getLoadingText() {
      return ('loadingText' in params) ? params.loadingText : "Loading...";
    }

    function getValidCodeText() {
      return ('validCodeTxt' in params) ? params.validCodeTxt : 'Fields have been auto filled.';
    }

    function getInvalidCodeText() {
        return ('invalidCodeTxt' in params) ? params.invalidCodeTxt : 'Unknown access code.';
    }

    function fillAccessCode(data) {
      if (autofillByCondition) {
        // update the widget's hidden input's value
        JFCustomWidget.sendData({ value: code });
        
        var dataValue = data.value ? data.value.trim() : '';    
        // throttle timer and trigger button click to fetch data 
        if (dataValue && populatedValue !== dataValue) {
          accessCodeEl.value = populatedValue = dataValue;
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(function() {
            autofillBtn.click();
          }, 1000);
        }
      } else {
        // turn off autofill for enterprise #3173309
        accessCodeEl.value = data.value || '';
        JFCustomWidget.sendData({ value: code });
      }
    }
    
    function resetAccessCode() {
      accessCodeEl.value = code = '';
      messageEl.style.display = 'none';
      // reset the widget's hidden input's value
      JFCustomWidget.sendData({ value: '' });
      JFCustomWidget.hideWidgetError();
      resizeWidget();
    }
    
    /**
     * Get widget data
     */
     function getData() {
       if (!includeInputValue) {
         code = '';
       }
       return {
         valid: !!code,
         value: code
       };
     }

    /**
     * Resize widget
     */
    function resizeWidget() {
      var height = document.getElementsByTagName('body')[0].clientHeight || 94;
      if (JFCustomWidget.isFromCardform() && height < 94) {
        height = 94;
      }
      JFCustomWidget.requestFrameResize({
        height: height
      });
    }

    /**
     * Add event listener
     */
    function addEventListener(el, eventName, handler) {
      if (el.addEventListener) {
        el.addEventListener(eventName, handler);
      } else {
        el.attachEvent('on' + eventName, function() {
          handler.call(el);
        });
      }
    }

    /**
     * Ajax Helper
     */
    function Ajax(data) {
      var isXDomainRequest = false;
      var http = new XMLHttpRequest();
      if (!http) {
        throw new Error("Http request is nowhere to be found");
      }

      // force same protocol
      if (getIEVersion() <= 9) {
        data.url = data.url.replace(/^https?:/, window.location.protocol);
      }

      if ("withCredentials" in http) {
        // XHR for Chrome/Firefox/Opera/Safari.
        http.open(data.method || "POST", data.url, true);
      } else if (typeof XDomainRequest !== "undefined") {
        // XDomainRequest for IE.
        http = new XDomainRequest();
        http.open(data.method || "POST", data.url);
        isXDomainRequest = true;
      } else {
        // CORS not supported.
        http = null;
      }

      if (!http) {
        throw new Error('CORS not supported');
      }

      // default headers
      // only set headers for non-ie and IE9 above
      if (!isXDomainRequest) {
        var headers = {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };

        // merge custom headers
        if (data.headers) {
          for (var x in data.headers) {
            headers[x] = data.headers[x];
          }
        }

        // set request header
        for (var h in headers) {
          http.setRequestHeader(h, headers[h]);
        }
      }

      // on success/load
      http.onload = function() {
        // console.log('Normal ajax onload', http);
        data.hasOwnProperty('success') && data.success(http);
      };

      // on error
      http.onerror = function() {
        data.hasOwnProperty('error') && data.error(http);
      };

      // build parameters
      var formdata = data.parameters;
      if (typeof data.parameters === 'object') {
        var o = [];
        for (var x in data.parameters) {
          var encoded = [x, encodeURIComponent(data.parameters[x])];
          o.push(encoded.join('='));
        }
        formdata = o.join('&');
      }

      // send request
      http.send(formdata);
    }

    /**
     * Get the IE version otherwise 'undefined'
     */
    function getIEVersion() {
      var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    }

    /**
     * Change letter to number
     */
    function changeLetterToNumber(letter) {
      var column = 0, length = letter.length;
      for (var i = 0; i < length; i++)
      {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
      }
      return column;
    }
  }

  JFCustomWidget.subscribe('ready', function(data) {
    var widget = new ExcelAutoFill(data);
    widget.init();
    
    JFCustomWidget.subscribe("submit", function() {
      JFCustomWidget.sendSubmit(widget.getData());
    });

    JFCustomWidget.subscribe('show', function() {
      widget.resizeWidget();
    });
    
    JFCustomWidget.subscribe('populate', widget.fillAccessCode);
    JFCustomWidget.subscribe('clear', widget.resetAccessCode);
  });
});