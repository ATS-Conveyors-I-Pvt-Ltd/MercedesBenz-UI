# Mercedes-Benz Digital Assembly Platform (DAP)

A state-of-the-art industrial manufacturing dashboard designed to digitize shop floor operations. This Digital Assembly Platform provides real-time visualization of production health, tracks key performance indicators (KPIs), and empowers operators with live Andon monitoring tools.

### 🌟 Key Features

*   **Executive Dashboard:** Specific global visualization of factory pulses, including alarm counts and production status, powered by **Recharts**.
*   **Real-Time Andon System:** Shop floor monitoring (e.g., Trim 4) displaying "Target vs. Actual" output with live status indicators (Green/Red visual logic).
*   **Breakdown & Issue Management:** Streamlined workflow for reporting and viewing production line issues.
*   **Secure Administration:** Role-based access control with a detailed Matrix for granting/revoking module permissions.
*   **Comprehensive Reporting:** Full audit trails of user actions and infeed reports, complete with one-click **Excel (.xlsx)** export.
*   **Premium UX:** A high-end dark-mode interface featuring glassmorphism, ambient video backgrounds, and smooth micro-interactions.

### 🛠 Tech Stack

*   **Frontend:** React (Vite), React Router v7, Tailwind/Custom CSS
*   **Visualization:** Recharts, Lucide React (Icons)
*   **Backend:** Node.js, Express
*   **Database:** MSSQL (Microsoft SQL Server)
*   **Utilities:** XLSX (Excel Export), Concurrently

### 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application (Frontend + Backend):**
    ```bash
    npm run dev
    ```
