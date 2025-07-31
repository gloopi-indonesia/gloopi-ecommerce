# Requirements Document

## Introduction

Gloopi is a B2B & B2C e-commerce platform for industrial gloves serving medical, manufacturing, and food sectors in Indonesia. The platform consists of an integrated admin dashboard for internal operations and a customer-facing storefront. The system operates with a quotation-based business model rather than direct payments, supporting both individual and bulk customers with Indonesian language and IDR currency.

## Requirements

### Requirement 1

**User Story:** As a business administrator, I want to manage quotations and purchase orders, so that I can track customer requests and convert them to sales orders efficiently.

#### Acceptance Criteria

1. WHEN a customer submits a PO request THEN the system SHALL create a new quotation with "Pending" status
2. WHEN an admin reviews a quotation THEN the system SHALL allow status updates to "Approved", "Rejected", or "Converted to Order"
3. WHEN a quotation is approved THEN the system SHALL allow conversion to a sales order
4. WHEN a quotation status changes THEN the system SHALL log the change with timestamp and admin user
5. IF a quotation includes shipping address THEN the system SHALL store and display it in the quotation details
##
# Requirement 2

**User Story:** As a business administrator, I want to manage sales orders and invoices, so that I can track order fulfillment and payment status.

#### Acceptance Criteria

1. WHEN a quotation is converted to order THEN the system SHALL create a sales order with "New" status
2. WHEN an admin processes an order THEN the system SHALL allow status updates to "Processing", "Shipped", "Delivered", or "Cancelled"
3. WHEN an order is created THEN the system SHALL generate an invoice with unique invoice number
4. WHEN an invoice is generated THEN the system SHALL calculate totals including any applicable taxes
5. WHEN payment is received THEN the system SHALL allow marking invoice as "Paid" with payment date

### Requirement 3

**User Story:** As a business administrator, I want to generate PPN tax invoices, so that I can provide proper tax documentation to customers who request it.

#### Acceptance Criteria

1. WHEN a customer requests PPN invoice THEN the system SHALL generate a tax invoice with proper PPN calculation
2. WHEN generating PPN invoice THEN the system SHALL include customer tax information and company details
3. WHEN PPN invoice is created THEN the system SHALL assign a unique tax invoice number following Indonesian standards
4. WHEN PPN invoice is generated THEN the system SHALL store it for future reference and reprinting
5. IF customer doesn't have tax information THEN the system SHALL prompt for required tax details

### Requirement 4

**User Story:** As a business administrator, I want to manage customer and company profiles, so that I can maintain accurate customer information for orders and invoicing.

#### Acceptance Criteria

1. WHEN a new customer registers THEN the system SHALL create a customer profile with contact information
2. WHEN customer is a company THEN the system SHALL store company details including tax information
3. WHEN customer information changes THEN the system SHALL allow profile updates with change history
4. WHEN viewing customer profile THEN the system SHALL display order history and payment status
5. IF customer is B2B THEN the system SHALL require company registration details#
## Requirement 5

**User Story:** As a business administrator, I want to manually input shipping tracking numbers, so that I can provide delivery tracking information to customers.

#### Acceptance Criteria

1. WHEN an order is shipped THEN the system SHALL allow manual input of tracking number (resi)
2. WHEN tracking number is added THEN the system SHALL update order status to "Shipped"
3. WHEN tracking information is entered THEN the system SHALL notify customer via email or system notification
4. WHEN viewing order details THEN the system SHALL display tracking number and shipping information
5. IF tracking number is updated THEN the system SHALL log the change with timestamp

### Requirement 6

**User Story:** As a business administrator, I want to view basic sales and payment reports, so that I can monitor business performance and identify overdue invoices.

#### Acceptance Criteria

1. WHEN accessing reports THEN the system SHALL display sales summary by date range
2. WHEN viewing payment reports THEN the system SHALL show paid, pending, and overdue invoices
3. WHEN generating reports THEN the system SHALL allow filtering by customer, product category, or date range
4. WHEN viewing overdue invoices THEN the system SHALL highlight invoices past due date
5. WHEN exporting reports THEN the system SHALL provide data in Excel or PDF format

### Requirement 7

**User Story:** As a potential customer, I want to view the landing page, so that I can understand Gloopi's value proposition and product offerings for my industry.

#### Acceptance Criteria

1. WHEN visiting the homepage THEN the system SHALL display why choose Gloopi section
2. WHEN viewing landing page THEN the system SHALL show product categories with industry focus
3. WHEN browsing categories THEN the system SHALL highlight medical, manufacturing, and food industry applications
4. WHEN viewing content THEN the system SHALL display all text in Indonesian language
5. IF user wants more information THEN the system SHALL provide clear navigation to product catalog### Re
quirement 8

**User Story:** As a customer, I want to browse the product catalog with filters, so that I can find gloves suitable for my specific use case and industry needs.

#### Acceptance Criteria

1. WHEN accessing catalog THEN the system SHALL display all available glove products
2. WHEN filtering products THEN the system SHALL allow filtering by use case (medical, manufacturing, food)
3. WHEN viewing products THEN the system SHALL show product images, specifications, and pricing information
4. WHEN filtering is applied THEN the system SHALL update results in real-time
5. IF no products match filter THEN the system SHALL display appropriate message with suggestions

### Requirement 9

**User Story:** As a customer, I want to add products to cart and request purchase orders, so that I can initiate the quotation process for my glove requirements.

#### Acceptance Criteria

1. WHEN selecting products THEN the system SHALL allow adding items to shopping cart
2. WHEN in cart THEN the system SHALL allow quantity adjustments and item removal
3. WHEN ready to order THEN the system SHALL provide PO request form instead of direct checkout
4. WHEN submitting PO request THEN the system SHALL collect customer information and shipping address (optional)
5. WHEN PO is submitted THEN the system SHALL send confirmation to customer and create quotation for admin

### Requirement 10

**User Story:** As a customer, I want to track my orders and invoices, so that I can monitor the status of my purchases and payment obligations.

#### Acceptance Criteria

1. WHEN logged in THEN the system SHALL display customer portal with order history
2. WHEN viewing orders THEN the system SHALL show current status and tracking information if available
3. WHEN viewing invoices THEN the system SHALL display payment status and due dates
4. WHEN tracking number is available THEN the system SHALL display shipping tracking information
5. IF invoice is overdue THEN the system SHALL highlight it with appropriate status indicator### Requi
rement 11

**User Story:** As a customer, I want to request tax invoices, so that I can obtain proper PPN documentation for my business accounting needs.

#### Acceptance Criteria

1. WHEN viewing paid invoices THEN the system SHALL provide option to request PPN tax invoice
2. WHEN requesting tax invoice THEN the system SHALL collect required tax information if not already provided
3. WHEN tax invoice request is submitted THEN the system SHALL notify admin for processing
4. WHEN tax invoice is ready THEN the system SHALL notify customer and provide download link
5. IF customer information is incomplete THEN the system SHALL prompt for missing tax details

### Requirement 12

**User Story:** As a system user, I want all monetary values displayed in Indonesian Rupiah, so that I can work with familiar currency formatting.

#### Acceptance Criteria

1. WHEN displaying prices THEN the system SHALL format amounts in IDR with proper thousand separators
2. WHEN calculating totals THEN the system SHALL use IDR currency throughout the system
3. WHEN generating invoices THEN the system SHALL display all amounts in Rupiah format
4. WHEN viewing reports THEN the system SHALL show financial data in IDR currency
5. IF performing calculations THEN the system SHALL maintain precision for Indonesian currency standards

### Requirement 13

**User Story:** As any system user, I want to interact with the platform in Indonesian language, so that I can use the system in my native language.

#### Acceptance Criteria

1. WHEN accessing any page THEN the system SHALL display all interface text in Indonesian
2. WHEN viewing error messages THEN the system SHALL show messages in Indonesian language
3. WHEN receiving notifications THEN the system SHALL send content in Indonesian
4. WHEN generating documents THEN the system SHALL use Indonesian language for all text
5. IF system generates automated content THEN the system SHALL use proper Indonesian formatting and terminology### 
Requirement 14

**User Story:** As a business administrator, I want to view analytics and metrics about my business, so that I can make data-driven decisions and monitor key performance indicators.

#### Acceptance Criteria

1. WHEN accessing analytics dashboard THEN the system SHALL display key business metrics including total revenue, order count, and customer count
2. WHEN viewing metrics THEN the system SHALL show data for different time periods (daily, weekly, monthly, yearly)
3. WHEN analyzing performance THEN the system SHALL display conversion rates from quotations to orders
4. WHEN reviewing customer data THEN the system SHALL show customer acquisition trends and repeat customer rates
5. WHEN viewing product analytics THEN the system SHALL display best-selling products by category and industry
6. WHEN examining sales data THEN the system SHALL show revenue breakdown by B2B vs B2C customers
7. IF comparing periods THEN the system SHALL show growth percentages and trend indicators
8. WHEN exporting analytics THEN the system SHALL provide charts and data in downloadable formats### Requirem
ent 15

**User Story:** As a business administrator, I want to follow up on quotations and purchase orders by communicating with potential customers via phone or WhatsApp, so that I can improve conversion rates and provide personalized customer service.

#### Acceptance Criteria

1. WHEN viewing quotation details THEN the system SHALL display customer phone number with click-to-call functionality
2. WHEN following up on quotations THEN the system SHALL provide WhatsApp integration to send messages directly from the admin panel
3. WHEN communicating with customers THEN the system SHALL log all communication attempts with timestamps and notes
4. WHEN viewing customer profile THEN the system SHALL show communication history and follow-up reminders
5. WHEN quotation is pending THEN the system SHALL allow setting follow-up reminders with notification alerts
6. WHEN sending WhatsApp messages THEN the system SHALL use pre-defined templates for common follow-up scenarios
7. IF customer responds THEN the system SHALL allow updating quotation status based on communication outcome
8. WHEN tracking communications THEN the system SHALL show response rates and follow-up effectiveness metrics