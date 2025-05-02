# Implementation Plan

# InvoicesFlow

### **Description**

InvoiceFlow is a web application designed to streamline the management of job providers and their corresponding payments within an organization. The platform ensures a structured workflow for handling invoices, allowing managers, finance teams, and providers to collaborate efficiently.

### **Objective**

The primary goal of InvoiceFlow is to simplify and centralize the invoice submission, approval, and validation process, reducing manual efforts and ensuring seamless communication between all stakeholders.

### **User Roles & Responsibilities**

**Admin & Super Admin**

*   Manage clients, campaigns, providers, managers, jobs and app settings

### **Core Features**

*   **Clients, Campaigns, Managers and Providers Management**:
    *   Create, Read, Update and Delete
*   **Job Management**:
    *   Create, Read, Update and Delete
    *   Filtering and Sorting
    *   Categorization: by Client, Campaign, Manager and Provider
	  *   Documents upload
	  *   Status update
*   **Email Notifications**: Automated email alerts for status updates
*   **Invoice Uploads**: Public expirable pages for providers to upload invoices
*   **Access Control**: Login-only access without a public registration option

### **Authentication & User Management**

*   **Restricted Access**: The platform does not allow public registration.

### **Access Control & Data Protection**

**Data Encryption**: All sensitive data, including invoices and user information, is encrypted both in transit (TLS/SSL) and at rest.

**Session Management**: Automatic session expiration and secure authentication tokens prevent unauthorized access.

*   **Admins**: Full control over clients, campaigns, providers, managers and jobs

### **Notification & Audit Logs**

**Cron Jobs**: Managers configure email notification schedules that will be handled by the hosting Cron Job system

**Email Notifications**: Users receive notifications for key actions, ensuring real-time awareness of jobs updates

**Audit Logs**: All critical actions (jobs creation, validation, user management) are logged to track changes and ensure accountability

### **System Architecture & Tech Stack**

The platform uses a **serverless architecture**, ensuring scalability, security, and cost efficiency. The platform leverages **Vercel** for frontend hosting and **Supabase** for backend services, including database management, authentication, storage, and business logic execution.



**System architecture**

The system follows a **fully serverless approach**, eliminating the need for traditional backend infrastructure while maintaining high availability and performance.

*   **Frontend:** A modern **React** application built with **Vite** and styled using **Tailwind CSS**, hosted on **Vercel** for fast, serverless deployment.
*   **Backend:** Supabase provides backend functionalities, replacing traditional backend servers with **Edge Functions** for executing business logic.
*   **Database:** A **PostgreSQL** database hosted on Supabase, utilizing **Row-Level Security (RLS)** policies for enforcing fine-grained access control.
*   **Authentication:** **Supabase Auth** with **JWT-based authentication** and **RLS-based access control** ensures secure, role-based access for different user types.
*   **File Storage:** Invoice documents and other relevant files are stored securely in **Supabase Storage**, with access control policies in place.
*   **API & Business Logic:** **Supabase Edge Functions** handle server-side processing, reducing frontend complexity while keeping API requests efficient.
*   **Notifications:** Email notifications are managed using **Supabase Functions** integrated with third-party email providers (e.g., Resend, SendGrid, or SMTP).



**Tech Stack Overview**

*   **Frontend:** React + Vite + TypeScript + Tailwind CSS
*   **Hosting:** Vercel (serverless deployment)
*   **Backend:** Vercel and Supabase Edge Functions (serverless logic) + Vercel Cron Jobs
*   **Database:** Supabase (PostgreSQL with RLS)
*   **Authentication:** Supabase Auth (JWT + RLS-based access control)
*   **Storage:** Supabase Storage (for invoice documents)
*   **Notifications:** Email service (Resend, SendGrid, or SMTP)
*   **Security:** SSL/TLS encryption, RBAC, RLS, JWT authentication



**Benefits of Serverless Architecture**

*   **Scalability**: Automatically scales based on demand, ensuring optimal performance.
*   **Cost-Efficiency**: Pay-as-you-go model eliminates the need for maintaining dedicated servers.
*   **Security**: Built-in authentication, RLS, and Supabase’s managed infrastructure ensure data security.
*   **Rapid Development**: Eliminates backend setup overhead, enabling faster development cycles.

### Design

*   Clean, modern, and user-friendly interface. The UI is simple yet professional, focusing on usability and efficiency.
*   The layout follows a dashboard-style design, with a sidebar for navigation and a main content area for managing services and providers.
*   The data tables support filtering, sorting, and pagination, ensuring an intuitive experience.
*   The design follows a minimalistic aesthetic, using Tailwind CSS for styling, with a focus on readability and accessibility.
*   Has Dark mode support
*   The color scheme should be neutral with subtle accent colors for important actions and notifications.
*   Has a fully responsive design, ensuring optimal usability across desktops, tablets, and mobile devices. The layout adapts seamlessly, with the sidebar collapsing into a menu on smaller screens.

### Initial Database Structure (public schema)

#### profiles

*   id
*   email
*   first\_name
*   last\_name
*   role (super\_admin, admin, finance)

#### managers (external users who only interact through email notifications)

*   id
*   active (true or false)
*   email
*   name

#### providers (external users who only interact through email notifications)

*   id
*   active (true or false)
*   email
*   name
*   iban
*   country

#### clients

*   id
*   active (true or false)
*   name

#### campaigns

*   id
*   active (true or false)
*   name
*   duration (# of months)
*   revenue
*   estimated\_cost
*   client\_id

#### custom\_fields

*   id
*   name
*   description
*   type (initially set up "text", "currency" and "date" as the available types)

#### **jobs**

*   id
*   status (inactive, active, closed)
*   months (multi-select. enum with months list)
*   value
*   currency ("euro" by default)
*   invoices (list document urls)
*   manager\_ok (boolean)
*   paid (boolean)
*   due\_date
*   private\_notes
*   public\_notes
*   manager\_id
*   provider\_id
*   client\_id
*   campaign\_id
*   provider\_notification\_schedule\_id

#### jobs\_custom\_fields

*   id
*   job\_id
*   custom\_field\_id

#### providers\_notifications\_schedules

*   id
*   name
*   days (represent which days of the month are considered for the corresponding schedule)
*   hour

### Workflows

#### New Job

1. The **Admin** creates a new job.
2. The **Admin** fill all the fields, including associating the **Manager** and the **Provider**
3. When all the fields are validated, the **Admin** changes the job to **pending\_provider**

#### Upload invoice

1. An email notification is sent (based on the job schedule) to the **Provider** with an unique link for a page to upload the invoice
2. The **Provider** receives the email and follows the link to upload the document
3. When the document is uploaded, the "document" field is filled with the document URL
4. An email notification is sent to the **Admin** so that he can validate the invoice document.
5. If everything is ok, then the **Admin** updates the job status to "**pending\_finance**"

#### Finance updates the Job status

1. The **Finance** user checks the "closed" field after the payment is completed
2. After that, the **Admin, Manager and Provider** receive an email notification
