require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

/**
 * View order base page, contains functions that can be used on view/edit order page
 * @class
 * @extends BOBasePage
 */
class ViewOrderBasePage extends BOBasePage {
  /**
   * @constructs
   * Setting up texts and selectors to use on view/edit order page
   */
  constructor() {
    super();

    this.pageTitle = 'Order';
    this.partialRefundValidationMessage = 'A partial refund was successfully created.';
    this.successfulAddProductMessage = 'The product was successfully added.';
    this.successfulDeleteProductMessage = 'The product was successfully removed.';
    this.errorMinimumQuantityMessage = 'Minimum quantity of "3" must be added';
    this.errorAddSameProduct = 'This product is already in your order, please edit the quantity instead.';
    this.errorAddSameProductInInvoice = invoice => `This product is already in the invoice #${invoice}, `
      + 'please edit the quantity instead.';
    this.noAvailableDocumentsMessage = 'There is no available document';
    this.updateSuccessfullMessage = 'Update successful';
    this.commentSuccessfullMessage = 'Comment successfully added.';
    this.validationSendMessage = 'The message was successfully sent to the customer.';
    this.errorAssignSameStatus = 'The order has already been assigned this status.';
    this.discountMustBeNumberErrorMessage = 'Discount value must be a number.';
    this.invalidPercentValueErrorMessage = 'Percent value cannot exceed 100.';
    this.percentValueNotPositiveErrorMessage = 'Percent value must be greater than 0.';
    this.discountCannotExceedTotalErrorMessage = 'Discount value cannot exceed the total price of this order.';

    // Selectors
    this.alertBlock = 'div.alert[role=\'alert\'] div.alert-text';

    // Order actions selectors
    this.orderStatusesSelect = '#update_order_status_action_input';
    this.updateStatusButton = '#update_order_status_action_btn';
    this.viewInvoiceButton = 'form.order-actions-invoice a[data-role=\'view-invoice\']';
    this.viewDeliverySlipButton = 'form.order-actions-delivery a[data-role=\'view-delivery-slip\']';
    this.partialRefundButton = 'button.partial-refund-display';
    this.returnProductsButton = '#order-view-page button.return-product-display';
  }

  /*
  Methods
   */

  // Methods for order actions
  /**
   * Is update status button disabled
   * @param page {Page} Browser tab
   * @returns {Promise<boolean>}
   */
  isUpdateStatusButtonDisabled(page) {
    return this.elementVisible(page, `${this.updateStatusButton}[disabled]`, 1000);
  }

  /**
   * Is view invoice button visible
   * @param page {Page} Browser tab
   * @returns {Promise<boolean>}
   */
  isViewInvoiceButtonVisible(page) {
    return this.elementVisible(page, this.viewInvoiceButton, 1000);
  }

  /**
   * Is partial refund button visible
   * @param page {Page} Browser tab
   * @returns {Promise<boolean>}
   */
  isPartialRefundButtonVisible(page) {
    return this.elementVisible(page, this.partialRefundButton, 1000);
  }

  /**
   * Is delivery slip button visible
   * @param page {Page} Browser tab
   * @returns {Promise<boolean>}
   */
  isDeliverySlipButtonVisible(page) {
    return this.elementVisible(page, this.viewDeliverySlipButton, 1000);
  }

  /**
   * Select order status
   * @param page {Page} Browser tab
   * @param status {string} Status to edit
   * @returns {Promise<void>}
   */
  async selectOrderStatus(page, status) {
    await this.selectByVisibleText(page, this.orderStatusesSelect, status);
  }

  /**
   * Get order status
   * @param page {Page} Browser tab
   * @returns {Promise<string>}
   */
  async getOrderStatus(page) {
    return this.getTextContent(page, `${this.orderStatusesSelect} option[selected='selected']`, false);
  }

  /**
   * Modify the order status from the page header
   * @param page {Page} Browser tab
   * @param status {string} Status to edit
   * @returns {Promise<string>}
   */
  async modifyOrderStatus(page, status) {
    const actualStatus = await this.getOrderStatus(page);

    if (status !== actualStatus) {
      await this.selectByVisibleText(page, this.orderStatusesSelect, status);
      await this.clickAndWaitForNavigation(page, this.updateStatusButton);
      return this.getOrderStatus(page);
    }

    return actualStatus;
  }

  /**
   * Does status exist
   * @param page {Page} Browser tab
   * @param statusName {string} Status to check
   * @returns {Promise<boolean>}
   */
  async doesStatusExist(page, statusName) {
    const options = await page.$$eval(
      `${this.orderStatusesSelect} option`,
      all => all.map(option => option.textContent),
    );

    return options.indexOf(statusName) !== -1;
  }

  /**
   * Click on view invoice button to download the invoice
   * @param page {Page} Browser tab
   * @returns {Promise<void>}
   */
  async viewInvoice(page) {
    return this.clickAndWaitForDownload(page, this.viewInvoiceButton);
  }

  /**
   * Click on view delivery slip button to download the invoice
   * @param page {Page} Browser tab
   * @returns {Promise<void>}
   */
  async viewDeliverySlip(page) {
    return this.clickAndWaitForDownload(page, this.viewDeliverySlipButton);
  }

  /**
   * Click on partial refund button
   * @param page {Page} Browser tab
   * @returns {Promise<void>}
   */
  async clickOnPartialRefund(page) {
    await page.click(this.partialRefundButton);
    await this.waitForVisibleSelector(page, this.refundProductQuantity(1));
  }

  /**
   * Add partial refund product
   * @param page {Page} Browser tab
   * @param productRow {number} Product row on table
   * @param quantity {number} Quantity value to set
   * @param amount {number} Amount value to set
   * @param shipping {number} Shipping cost to set
   * @returns {Promise<string>}
   */
  async addPartialRefundProduct(page, productRow, quantity = 0, amount = 0, shipping = 0) {
    await this.setValue(page, this.refundProductQuantity(productRow), quantity.toString());
    if (amount !== 0) {
      await this.setValue(page, this.refundProductAmount(productRow), amount.toString());
    }
    if (shipping !== 0) {
      await this.setValue(page, this.refundShippingCost(productRow), shipping.toString());
    }
    await this.clickAndWaitForNavigation(page, this.partialRefundSubmitButton);
    return this.getAlertSuccessBlockParagraphContent(page);
  }

  /**
   * Is return products button visible
   * @param page {Page} Browser tab
   * @returns {Promise<boolean>}
   */
  isReturnProductsButtonVisible(page) {
    return this.elementVisible(page, this.returnProductsButton, 2000);
  }
}

module.exports = new ViewOrderBasePage();
