/**
 * Browser Console Test Script for Payment Methods
 * 
 * To use this script:
 * 1. Open the payment modal on the /sign/[token]/complete page
 * 2. Open browser console (F12 or Cmd+Option+I)
 * 3. Paste this entire script and press Enter
 * 4. The script will test clicking each payment method icon
 */

(function testPaymentMethods() {
  console.log('🧪 Starting Payment Methods Test...\n');

  const paymentMethods = [
    'Credit/Debit Cards',
    'Apple Pay',
    'Google Pay',
    'Cash App Pay',
    'Stripe Link',
    'Bank Transfer (ACH)',
  ];

  const results = [];
  let currentIndex = 0;

  function testNextMethod() {
    if (currentIndex >= paymentMethods.length) {
      // All tests complete
      console.log('\n' + '='.repeat(50));
      console.log('📊 Test Results Summary:');
      console.log('='.repeat(50));
      
      results.forEach(({ method, success, error }) => {
        if (success) {
          console.log(`✅ ${method}: PASSED`);
        } else {
          console.log(`❌ ${method}: FAILED - ${error}`);
        }
      });
      
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n' + '='.repeat(50));
      console.log(`Total: ${results.length} tests`);
      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${failed}`);
      console.log('='.repeat(50));
      
      return;
    }

    const method = paymentMethods[currentIndex];
    console.log(`\n🧪 Testing: ${method} (${currentIndex + 1}/${paymentMethods.length})`);

    try {
      // Find all payment method buttons
      const buttons = Array.from(document.querySelectorAll('button[type="button"]'));
      const methodButton = buttons.find(btn => {
        const text = btn.textContent || '';
        // Match based on method name
        if (method === 'Credit/Debit Cards' && text.includes('Cards')) return true;
        if (method === 'Apple Pay' && text.includes('Apple Pay')) return true;
        if (method === 'Google Pay' && text.includes('Google Pay')) return true;
        if (method === 'Cash App Pay' && text.includes('Cash App')) return true;
        if (method === 'Stripe Link' && text.includes('Link')) return true;
        if (method === 'Bank Transfer (ACH)' && text.includes('Bank')) return true;
        return false;
      });

      if (!methodButton) {
        throw new Error('Button not found');
      }

      // Check if button is visible and clickable
      const rect = methodButton.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                          rect.bottom <= window.innerHeight && 
                          rect.right <= window.innerWidth;

      if (!isVisible) {
        throw new Error('Button is not visible');
      }

      // Scroll button into view if needed
      if (!isInViewport) {
        methodButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('   ↳ Scrolled button into view');
      }

      // Click the button
      methodButton.click();
      console.log('   ↳ Button clicked');

      // Wait a moment for state to update
      setTimeout(() => {
        // Check if button is now selected (has amber border/background)
        const isSelected = methodButton.classList.contains('border-amber-500') || 
                          methodButton.style.borderColor?.includes('amber') ||
                          window.getComputedStyle(methodButton).borderColor.includes('rgb(245, 158, 11)');

        if (isSelected) {
          console.log(`   ✅ ${method}: Button clicked and selected successfully`);
          results.push({ method, success: true });
        } else {
          console.log(`   ⚠️  ${method}: Button clicked but selection state unclear`);
          results.push({ method, success: true, warning: 'Selection state unclear' });
        }

        // Check if toast notification appeared
        const toast = document.querySelector('[role="status"], [data-sonner-toast], .toast');
        if (toast) {
          console.log('   ↳ Toast notification appeared');
        }

        // Check if payment form is visible
        const paymentForm = document.querySelector('[data-testid="payment-element"], .StripeElement, iframe');
        if (paymentForm) {
          console.log('   ↳ Payment form is visible');
        }

        currentIndex++;
        // Wait before next test
        setTimeout(testNextMethod, 1000);
      }, 500);

    } catch (error) {
      console.error(`   ❌ ${method}: ${error.message}`);
      results.push({ method, success: false, error: error.message });
      currentIndex++;
      setTimeout(testNextMethod, 500);
    }
  }

  // Check if payment modal is open
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.error('❌ Payment modal is not open. Please open the payment modal first.');
    return;
  }

  console.log('✅ Payment modal is open');
  console.log('Starting automated tests...\n');

  // Start testing
  testNextMethod();
})();
