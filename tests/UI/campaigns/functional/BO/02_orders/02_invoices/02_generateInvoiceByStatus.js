// Import utils
import helper from '@utils/helpers';

// Import test context
import testContext from '@utils/testContext';

// Import login steps
import loginCommon from '@commonTests/BO/loginBO';

require('module-alias/register');

// Import utils
const files = require('@utils/files');

// Import pages
const dashboardPage = require('@pages/BO/dashboard');
const invoicesPage = require('@pages/BO/orders/invoices/index');
const ordersPage = require('@pages/BO/orders/index');
const orderPageTabListBlock = require('@pages/BO/orders/view/tabListBlock');

// Import data
const {Statuses} = require('@data/demo/orderStatuses');

const baseContext = 'functional_BO_orders_invoices_generateInvoiceByStatus';

// Import expect from chai
const {expect} = require('chai');

let browserContext;
let page;
let filePath;

// 1 : Generate PDF file by status
describe('BO - Orders - Invoices : Generate PDF file by status', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  describe('Create 2 invoices by changing the order status', async () => {
    const tests = [
      {args: {orderRow: 1, status: Statuses.shipped.status}},
      {args: {orderRow: 2, status: Statuses.paymentAccepted.status}},
    ];
    tests.forEach((orderToEdit, index) => {
      it('should go to \'Orders > Orders\' page', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToOrdersPage${index + 1}`, baseContext);

        await dashboardPage.goToSubMenu(
          page,
          dashboardPage.ordersParentLink,
          dashboardPage.ordersLink,
        );

        await ordersPage.closeSfToolBar(page);

        const pageTitle = await ordersPage.getPageTitle(page);
        await expect(pageTitle).to.contains(ordersPage.pageTitle);
      });

      it(`should go to the order page n°${orderToEdit.args.orderRow}`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToOrderPage${index + 1}`, baseContext);

        await ordersPage.goToOrder(page, orderToEdit.args.orderRow);
        const pageTitle = await orderPageTabListBlock.getPageTitle(page);
        await expect(pageTitle).to.contains(orderPageTabListBlock.pageTitle);
      });

      it(`should change the order status to '${orderToEdit.args.status}' and check it`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `updateOrderStatus${index + 1}`, baseContext);

        const result = await orderPageTabListBlock.modifyOrderStatus(page, orderToEdit.args.status);
        await expect(result).to.equal(orderToEdit.args.status);
      });
    });
  });

  describe('Generate invoice by status', async () => {
    it('should go to \'Orders > Invoices\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToInvoicesPage', baseContext);

      await orderPageTabListBlock.goToSubMenu(
        page,
        orderPageTabListBlock.ordersParentLink,
        orderPageTabListBlock.invoicesLink,
      );

      const pageTitle = await invoicesPage.getPageTitle(page);
      await expect(pageTitle).to.contains(invoicesPage.pageTitle);
    });

    it('should check the error message when we don\'t select a status', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkNoSelectedStatusMessageError', baseContext);

      // Generate PDF
      const textMessage = await invoicesPage.generatePDFByStatusAndFail(page);

      await expect(textMessage).to.equal(invoicesPage.errorMessageWhenNotSelectStatus);
    });

    it('should check the error message when there is no invoice in the status selected', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkNoInvoiceMessageError', baseContext);

      // Choose one status
      await invoicesPage.chooseStatus(page, Statuses.canceled.status);

      // Generate PDF
      const textMessage = await invoicesPage.generatePDFByStatusAndFail(page);

      await expect(textMessage).to.equal(invoicesPage.errorMessageWhenGenerateFileByStatus);
    });

    it('should choose the statuses, generate the invoice and check the file existence', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'selectStatusesAndCheckInvoiceExistence', baseContext);

      // Choose 2 status
      await invoicesPage.chooseStatus(page, Statuses.paymentAccepted.status);
      await invoicesPage.chooseStatus(page, Statuses.shipped.status);

      // Generate PDF
      filePath = await invoicesPage.generatePDFByStatusAndDownload(page);

      // Check that file exist
      const exist = await files.doesFileExist(filePath);
      await expect(exist).to.be.true;
    });

    it('should choose one status, generate the invoice and check the file existence', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'selectOneStatusAndCheckInvoiceExistence', baseContext);

      // Choose one status
      await invoicesPage.chooseStatus(page, Statuses.paymentAccepted.status);

      // Generate PDF
      filePath = await invoicesPage.generatePDFByStatusAndDownload(page);

      // Check that file exist
      const exist = await files.doesFileExist(filePath);
      await expect(exist).to.be.true;
    });
  });
});
