# EAST AFRICA UNIVERSITY, GAROWE
## FACULTY OF TECHNOLOGY AND ENGINEERING
## DEPARTMENT OF COMPUTER SCIENCE

# DESIGN AND DEVELOPMENT OF SOLAR KOWSAR
## A SOLAR ENERGY MANAGEMENT AND BILLING SYSTEM

### A SYSTEM DEVELOPMENT THESIS BOOK

Submitted in partial fulfilment of the requirements for the award of a Bachelor's Degree

**Student Name:** KOWSAR MOHAMED JAMAC  
**Student ID:** _______________________________  
**Department:** Computer Science  
**Faculty:** Technology and Engineering  
**University:** East Africa University, Garowe  
**Supervisor:** MR. MAAX  
**Year:** 2026

---

## Declaration

I declare that this thesis book is my original academic work prepared for the design and development of Solar Kowsar, a solar energy management and billing system. All ideas, findings, models, and statements obtained from other sources shall be acknowledged through appropriate academic referencing. Any questionnaire, interview, organizational record, or user-evaluation result included in the final submission shall be based only on genuine collected information.

**Name:** ______________________________  
**Signature:** ___________________________  
**Date:** _______________________________

## Approval Page

This thesis book entitled **Design and Development of Solar Kowsar: A Solar Energy Management and Billing System** has been submitted for examination with the approval of the undersigned supervisor.

**Supervisor:** __________________________  
**Signature:** ___________________________  
**Date:** _______________________________  
**Department/Faculty:** __________________  
**University:** __________________________

## Dedication

This work is dedicated to my family, lecturers, colleagues, and all people who supported my academic development and encouraged the application of information technology to practical challenges in the energy sector.

## Acknowledgement

I express my sincere appreciation to Almighty God for granting me the strength and opportunity to complete this academic work. I am grateful to my supervisor and lecturers for their guidance in research methods, system analysis, software development, and academic writing. I also appreciate the people who provided ideas, feedback, and technical assistance during the development and review of Solar Kowsar.

## Abstract

This study focused on the design and development of Solar Kowsar, a web-based solar energy management and billing system. The system was developed to organize customer records, billing, payments, electricity usage, solar data, equipment, maintenance, alarms, staff, tariffs, locations, expenses, notifications, reports, settings, and user administration in one platform. The study followed a design-and-development approach involving requirements identification, system analysis, interface design, implementation, and functional testing. The implemented application uses React and Vite for the frontend, Tailwind CSS and reusable UI components for the interface, React Router for navigation, and the Base44 platform for authentication, data storage, and backend functions. The system supports five roles: administrator, manager, technician, billing staff, and customer. Role-based access limits users to the routes and information required for their responsibilities. The completed system provides dashboards, data-entry forms, tables, charts, search, update, delete, reporting, notifications, and authentication workflows. Functional testing and production-build validation confirmed that the principal application modules compile and operate as designed. The system is an application-level management platform; direct physical control of panels, inverters, meters, and sensors is outside the implemented scope. The study recommends further user-acceptance testing, security testing, backups, and future integration with smart meters, payment services, and solar hardware where feasible.

## Table of Contents

Update the table of contents in Microsoft Word after opening the document. Use **References > Table of Contents > Update Table**.

1. Chapter One: Introduction  
2. Chapter Two: Literature Review  
3. Chapter Three: Methodology  
4. Chapter Four: System Analysis and Design  
5. Chapter Five: System Implementation and Testing  
6. Chapter Six: Conclusion and Recommendations  
7. References  
8. Appendices

## List of Abbreviations

- API - Application Programming Interface
- DBMS - Database Management System
- ICT - Information and Communication Technology
- IoT - Internet of Things
- kW - Kilowatt
- kWh - Kilowatt-hour
- PV - Photovoltaic
- RBAC - Role-Based Access Control
- SDLC - Software Development Life Cycle
- UI - User Interface
- UX - User Experience

# Chapter One: Introduction

## 1.1 Background of the Study

Electricity supports education, healthcare, communication, commerce, and household activities. Reliable electricity remains difficult to access in many developing communities, making solar photovoltaic technology an important alternative. Solar service providers require more than physical equipment: they also need organized information about customers, energy usage, solar production, billing, payments, equipment, maintenance, and staff activities.

Manual records and disconnected spreadsheets can make information difficult to search, update, protect, and report. They can also increase duplicated records and billing errors. Solar Kowsar was developed as a centralized web application that connects customer, technical, financial, and administrative information through one user interface.

## 1.2 Problem Statement

Solar energy providers manage different categories of information, including customer accounts, electricity usage, production readings, equipment, bills, payments, maintenance, alarms, and users. When these records are managed manually or in separate files, staff may spend unnecessary time searching for information and preparing reports. It can also be difficult to connect a customer's service record with usage, billing, payment, and technical status.

Therefore, there is a need for an integrated information-management system that provides controlled access to customer, billing, usage, solar, equipment, maintenance, and administrative records. Solar Kowsar addresses this need through a centralized web application.

## 1.3 Objectives

### General Objective

To design and develop Solar Kowsar, a solar energy management and billing system.

### Specific Objectives

1. To develop customer registration and customer-information management functions.
2. To develop billing, payment, tariff, and electricity-usage functions.
3. To develop solar-data, equipment, location, maintenance, and alarm functions.
4. To develop staff, employee, notification, expense, history, and reporting functions.
5. To implement authentication and role-based access for administrators, managers, technicians, billing staff, and customers.
6. To test the functionality and production build of the developed system.

## 1.4 Scope and Limitations

The implemented scope includes dashboard management, customers, billing, payments, daily usage, solar data, equipment, notifications, maintenance, alarms, staff, tariffs, locations, history, reports, expenses, settings, and employee/audit management. The application also includes login, registration, password recovery, role-based routing, language support, theme controls, and PDF-related reporting utilities.

The system manages information about solar operations but does not claim direct hardware control or automatic sensor integration. Smart meters, inverters, payment gateways, SMS services, and physical devices require additional integrations. Demonstration records are not presented as audited organizational performance.

## 1.5 Significance of the Study

The system is significant to Solar Kowsar because it centralizes operational information. Administrators can monitor records and reports, billing staff can manage customers and bills, technicians can follow equipment and maintenance information, and customers can access information permitted for their accounts. The project also provides a practical example of applying information systems to renewable-energy management in Somalia.

# Chapter Two: Literature Review

## 2.1 Related Areas

The study reviewed solar photovoltaic monitoring, smart metering, renewable-energy management, information systems, software usability, and digital billing. Solar monitoring provides information about production and performance. Smart metering provides digital consumption records. Information systems combine data storage, processing, retrieval, access control, and reporting. These areas support the design of an application that manages both technical and administrative information.

## 2.2 Existing Approaches

Manual systems are inexpensive to start but become difficult to search and maintain as records increase. Spreadsheet systems support calculations but can become fragmented and difficult to control for multiple users. Specialized monitoring systems can provide production data but may not manage customers, bills, staff, expenses, or reports. Solar Kowsar addresses the integration gap by combining these management functions in one application while remaining separate from direct hardware control.

## 2.3 Research Gap

Existing approaches often focus on one area, such as photovoltaic monitoring, smart metering, or billing. The gap addressed by this project is the integration of customer, billing, usage, solar, equipment, maintenance, notification, staff, tariff, location, expense, and administrative information for a Somali solar-energy service context.

## 2.4 Conceptual Framework

The inputs are customer records, billing records, usage data, solar data, equipment information, staff records, user accounts, maintenance records, alarm information, tariff information, location information, notifications, and expenses. The system processes include authentication, validation, storage, retrieval, updating, deletion, role filtering, billing management, dashboard calculation, notification management, and report preparation. The outputs include dashboards, customer records, bills, payment status, usage summaries, solar information, equipment status, maintenance records, alarms, notifications, reports, history, and expense summaries.

# Chapter Three: Methodology

## 3.1 Research and Development Approach

The project used a design-and-development approach. The main activities were problem identification, requirements analysis, system design, implementation, functional testing, and documentation. The application was developed iteratively as modules and role-based dashboards were implemented and reviewed.

## 3.2 Technologies Used

| Technology | Use in the System |
|---|---|
| JavaScript and JSX | Application source code and React components |
| React 18 | Component-based frontend framework |
| Vite | Development server and production build tool |
| Tailwind CSS | Responsive interface styling |
| Radix UI and reusable UI components | Forms, dialogs, menus, tables, and controls |
| React Router | Application routing |
| Base44 SDK and platform | Authentication, entities, API access, and backend functions |
| TanStack React Query | Query-client support and data management |
| Recharts | Dashboard charts and visual summaries |
| Lucide React | Interface icons |
| jsPDF and html2canvas | PDF/report export utilities |
| Visual Studio Code and Node.js | Development environment |

## 3.3 Data Collection and Analysis

Requirements were identified through project observation, review of solar-management activities, examination of the implemented modules, and review of relevant literature. If interviews or questionnaires are included in the final submission, the results must be collected from actual approved participants and reported accurately. System requirements were grouped into functional requirements and quality requirements such as usability, security, reliability, maintainability, performance, and data integrity.

# Chapter Four: System Analysis and Design

## 4.1 System Modules

The implemented system contains the following user-facing modules: Home dashboard, Customers, Billing, Payments, Daily Usage, Solar Data, Equipment, Notifications, Locations, Settings, User Management, Maintenance, History, Expenses, Reports, Alarms, Staff, Tariffs, Vendors, and Tasks. Authentication includes Login, Register, Forgot Password, and Reset Password screens.

## 4.2 Backend Entities

The Base44 project contains 17 entity definitions: Alarm, AuditLog, Billing, Customer, Employee, Equipment, Expense, Location, MaintenanceRequest, Notification, Settings, SolarData, Staff, Tariff, Task, User, and Vendor. These entities provide the data structures used by the application modules.

## 4.3 User Roles and Access

| Role | Main access |
|---|---|
| Administrator | Full system access and administration |
| Manager | Full system access and administration |
| Technician | Equipment, alarms, maintenance, tasks, and notifications |
| Billing staff | Customers, billing, payments, tariffs, reports, usage, and notifications |
| Customer | Own customer-facing account, bills, payments, usage, solar information, and notifications |

The application uses protected routes and role-based route filtering. A self-registered account is treated as a customer unless an authorized administrator assigns another role. Employee and audit information is restricted according to the implemented access rules.

## 4.4 Functional Requirements

1. The system shall authenticate registered users.
2. The system shall protect routes for unauthenticated users.
3. Authorized users shall create, view, update, and delete records permitted by their role.
4. The system shall manage customers, bills, payments, usage, solar data, equipment, notifications, maintenance, alarms, staff, tariffs, locations, expenses, vendors, and tasks.
5. The system shall provide dashboards and summaries relevant to each role.
6. The system shall support user management and audit information for authorized administrators.
7. The system shall provide language, theme, and configuration controls implemented in the application.

## 4.5 Non-Functional Requirements

The system should be usable, secure, maintainable, responsive, reliable, and able to support additional records and modules. Access control, data validation, regular backups, and security testing remain important for production deployment.

## 4.6 Database and Architecture

The frontend is organized into pages, reusable components, hooks, libraries, and an API client. The Base44 entity layer stores records. The application communicates with the API through `src/api/base44Client.js`. The routing layer is defined in `src/App.jsx`, while authentication and role state are managed through `src/lib/AuthContext.jsx` and `src/lib/permissions.js`.

# Chapter Five: System Implementation and Testing

## 5.1 Implementation

The implementation provides reusable React components, responsive layouts, forms, tables, dialogs, dashboard cards, charts, notifications, protected routes, and role-specific dashboards. The main role dashboards are Admin Dashboard, Billing Dashboard, Technician Dashboard, and Customer Dashboard.

## 5.2 Functional Test Cases

| Test | Action | Expected result |
|---|---|---|
| Login | Enter valid credentials | Authorized dashboard opens |
| Registration | Submit valid registration details | Account-registration workflow begins |
| Customer management | Create, edit, and delete a customer | Customer record changes are reflected |
| Billing | Create and update a bill | Billing record and status are displayed |
| Usage | Add a daily-usage record | Usage record is stored and listed |
| Solar data | Add a solar-data record | Solar information appears in the module |
| Equipment | Add or update equipment | Equipment status is displayed |
| Maintenance | Create and update a request | Maintenance status is updated |
| User management | Review or update an employee | Authorized changes are recorded |
| Role access | Open a restricted route | User is prevented from unauthorized access |
| Reports | Open the reporting page | Summary information is displayed |
| Logout | Select logout | User session ends |

The final thesis should mark each test as Pass or Fail based on an actual executed test and should not invent user-evaluation results.

## 5.3 Build and Quality Verification

The project was verified with the following commands:

```text
npm run lint
npm run build
```

The lint check and production build completed successfully after the missing admin dashboard entry, duplicate translation keys, and unused imports were corrected. A frontend-only development server can run with `npm run dev`; full Base44 API functionality requires `base44 dev` or configured Base44 environment variables.

## 5.4 Screenshots

Insert actual screenshots from the running system and use the following captions:

- Figure 5.1: Home dashboard
- Figure 5.2: Customers interface
- Figure 5.3: Billing interface
- Figure 5.4: Payments interface
- Figure 5.5: Daily Usage interface
- Figure 5.6: Solar Data interface
- Figure 5.7: Equipment interface
- Figure 5.8: Notifications interface
- Figure 5.9: Maintenance interface
- Figure 5.10: Alarms interface
- Figure 5.11: Staff interface
- Figure 5.12: Tariffs interface
- Figure 5.13: Locations interface
- Figure 5.14: History interface
- Figure 5.15: Reports interface
- Figure 5.16: Expenses interface
- Figure 5.17: Settings interface
- Figure 5.18: User Management interface
- Figure 5.19: Technician dashboard
- Figure 5.20: Billing dashboard
- Figure 5.21: Customer dashboard

# Chapter Six: Conclusion and Recommendations

## 6.1 Conclusion

Solar Kowsar provides an integrated web application for managing customer, billing, payment, usage, solar, equipment, maintenance, alarm, staff, tariff, location, expense, notification, reporting, and administrative information. The application uses role-based access so that users receive dashboards and routes related to their responsibilities. The implemented system meets the main objective of creating a centralized platform for solar-energy information management and billing.

## 6.2 Recommendations

The system should undergo formal user-acceptance testing with approved participants. Security testing, stronger validation, regular backups, and monitoring should be maintained. Future versions may integrate smart meters, inverters, payment services, SMS or email notifications, mobile applications, predictive maintenance, forecasting, and offline data capture where technically and organizationally feasible.

# References

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319-340.

DeLone, W. H., & McLean, E. R. (2003). The DeLone and McLean model of information systems success: A ten-year update. *Journal of Management Information Systems, 19*(4), 9-30.

World Bank. (2021). *Somalia Country Private Sector Diagnostic: Creating Markets in Somalia*. World Bank.

Additional references must be completed and verified from the actual sources consulted before final academic submission.

# Appendices

## Appendix A: Questionnaire

Include only an approved questionnaire and genuine responses if data collection is part of the study.

## Appendix B: Source Code and Repository

Source code: https://github.com/shalosomar-beep/solar-kowsar

## Appendix C: Deployment and Verification Notes

The repository contains the React/Vite application, Base44 configuration, entity definitions, source code, and project documentation. The application should be run with the configured Base44 environment for authenticated data operations.
