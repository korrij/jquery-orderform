// orderform.js
$(document).ready(function() {

    // --- VALIDATION HELPERS ---
    function isNonBlank(val) {
      return $.trim(val) !== "";
    }
  
    function isFiveDigitZip(val) {
      return /^\d{5}$/.test(val);
    }
  
    function isValidEmail(val) {
      // basic RFC‑2822-ish check
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(val);
    }
  
    // display or clear an error message in the given span
    function setError($span, msg) {
      $span.text(msg);
    }
  
    // validate a single field, by id
    function validateField(id) {
      var val = $.trim($("#" + id).val()),
          $err = $("#" + id + "Err"),
          ok = true;
  
      switch(id) {
        case "name":
        case "address":
        case "city":
          if (!isNonBlank(val)) {
            setError($err, "Required");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
  
        case "zip":
          if (!isNonBlank(val) || !isFiveDigitZip(val)) {
            setError($err, "Must be 5 digits");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
  
        case "email":
          if (!isNonBlank(val) || !isValidEmail(val)) {
            setError($err, "Invalid email");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
  
        case "email2":
          var email1 = $("#email").val();
          if (val !== email1) {
            setError($err, "Must match email");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
  
        case "shipaddr":
        case "shipcity":
          if (!isNonBlank(val)) {
            setError($err, "Required");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
  
        case "shipzip":
          if (!isNonBlank(val) || !isFiveDigitZip(val)) {
            setError($err, "Must be 5 digits");
            ok = false;
          } else {
            setError($err, "");
          }
          break;
      }
  
      return ok;
    }
  
    // Validate everything, return overall boolean
    function validateAll() {
      var fields = [
        "name","address","city","zip",
        "email","email2",
        "shipaddr","shipcity","shipzip"
      ];
  
      var ok = true;
      fields.forEach(function(id) {
        if (!$("#" + id).is(":disabled")) {
          if (!validateField(id)) {
            ok = false;
          }
        }
      });
      return ok;
    }
  
    // --- COPY BILLING TO SHIPPING ---
    $("#copy").change(function() {
      if (this.checked) {
        // copy values
        $("#shipaddr").val($("#address").val());
        $("#shipcity").val($("#city").val());
        $("#shipzip").val($("#zip").val());
        // copy state options & selection
        var sel = $("#state").val();
        $("#shipstate").val(sel);
        // disable shipping inputs
        $("#shipping input, #shipping select").prop("disabled", true);
        // clear any errors
        $("#shipping .error").text("");
      } else {
        // re-enable
        $("#shipping input, #shipping select").prop("disabled", false);
      }
    }).trigger("change");
  
  
    // --- ORDER CALCULATIONS ---
    function updateTotals() {
      var orderTotal = 0;
  
      $(".qty").each(function(index) {
        var idx = index + 1,
            qty = parseInt($(this).val(), 10);
        if (isNaN(qty) || qty < 0) {
          qty = 0;
          $(this).val("0");
        }
        var price = parseFloat($("#price" + idx).text()),
            lineTotal = qty * price;
  
        $("#total" + idx).text(lineTotal.toFixed(2));
        orderTotal += lineTotal;
      });
  
      $("#subt").text(orderTotal.toFixed(2));
  
      // Tax
      var shipState = $("#copy").is(":checked") ? $("#state").val() : $("#shipstate").val(),
          taxRate = (shipState === "TX") ? 0.08 : 0,
          taxAmt  = orderTotal * taxRate;
      $("#tax").text(taxAmt.toFixed(2));
      orderTotal += taxAmt;
  
      // Shipping
      var shipCost;
      if      (shipState === "TX") shipCost = 5;
      else if (shipState === "CA" || shipState === "NY") shipCost = 20;
      else                         shipCost = 10;
      $("#ship").text(shipCost.toFixed(2));
      orderTotal += shipCost;
  
      $("#gTotal").text(orderTotal.toFixed(2));
    }
  
    // attach quantity blur
    $(".qty").on("blur change", updateTotals);
  
    // make sure we run it once on load
    updateTotals();
  
  
    // --- EVENT BINDINGS FOR VALIDATION ---
    // on blur for personal + shipping fields
    $("#name, #address, #city, #zip, #email, #email2, #shipaddr, #shipcity, #shipzip")
      .on("blur", function() {
        validateField(this.id);
      });
  
    // on form submit re-validate; if any fail, prevent submit
    $("#order").on("submit", function(e) {
      if (!validateAll()) {
        e.preventDefault();
        $("#orderErr").text("Please fix the errors above before submitting.");
        // scroll to first error
        $('html, body').animate({
          scrollTop: $(".error:contains('Required'), .error:contains('Invalid email'), .error:contains('Must match'), .error:contains('5 digits')").first().closest("input, select").offset().top - 20
        }, 400);
      }
    });
  
  });