# NextGen Learners - A Modern LMS

NextGen Learners is a modern, feature-rich Learning Management System (LMS) built with a cutting-edge tech stack. It provides a seamless, interactive, and role-based experience for both teachers and students, fostering a dynamic and organized educational environment.

## ✨ Key Features

### 🧑‍🏫 Teacher Dashboard

- **Student Roster Management**: View a complete list of all registered students. Assign each student to a specific class (e.g., PG, Nursery, Class 1) directly from the roster.
- **Dynamic Timetable Scheduling**: Create and manage class schedules. Select a class, a subject for that class, a day, and a time to add a session to the timetable. Teachers can also remove sessions, with all changes reflecting in real-time on the relevant student dashboards.
- **Class-Based Subject Views**: Manage learning materials by first selecting a class, which then displays the specific subjects for that curriculum. This view is prepared for adding worksheets, quizzes, and starting live classes.
- **Individual Student Pages**: Click on any student in the roster to navigate to their dedicated detail page.
- **Badge Assignment**: Award students with achievement badges like "Homework Hero" or "Math Magician" to recognize their hard work.
- **AI-Powered Progress Reports**: Generate personalized weekly progress reports for students based on their performance, attendance, and areas for improvement using a powerful AI assistant.

### 🧒 Student Dashboard

- **Personalized Experience**: The student dashboard is tailored to the individual. Students only see the subjects and schedule for the class they've been assigned to by a teacher.
- **Today's Schedule**: A clear, at-a-glance view of the classes scheduled for the current day.
- **Interactive Calendar**: A full calendar view that highlights days with scheduled classes. Clicking on a day shows the events for that date.
- **My Courses**: A dedicated section displaying all subjects for the student's class. Clicking a subject opens a detailed view with tabs for Worksheets, Quizzes, and Saved Classes.
- **Achievements & Badges**: A section to view all the cool badges awarded by their teacher, tracking their accomplishments.

### 🤖 Core Functionality

- **Dual Roles**: Full authentication system with separate sign-up and login flows for "Student" and "Teacher" roles.
- **Real-Time Database**: Built on Firebase's Firestore, all data, from timetable updates to badge assignments, is synchronized in real-time across the platform.
- **AI Integration**: Leverages Genkit to provide AI-powered features like the student progress report generator.
- **Modern UI/UX**: A clean, responsive, and intuitive user interface built with ShadCN UI components and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore for database, Firebase Auth for authentication)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) for AI flows and prompts.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.

## 🚀 Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Firebase Setup

1.  This project is pre-configured to connect to a specific Firebase project. The configuration details are located in `src/lib/firebase.ts`.
2.  **Firestore Indexes**: The application's queries require specific composite indexes in Firestore. If you encounter `failed-precondition` errors in the browser console, they will usually include a direct link to create the required index in your Firebase console.

### Local Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    The application uses `concurrently` to run both the Next.js frontend and the Genkit AI server at the same time.
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application in action.

## 📁 Project Structure

```
/
├── src/
│   ├── app/                # Next.js App Router pages (student, teacher, login, etc.)
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── components/         # Shared React components (UI, dashboard elements)
│   ├── hooks/              # Custom React hooks (e.g., use-toast)
│   ├── lib/                # Core libraries, utilities, and configs (Firebase, subjects.ts)
│   └── ...
├── public/                 # Static assets
├── package.json            # Project dependencies and scripts
└── ...
```

I have created the new `README.md` file for your project. You can view it in the file list. Let me know if you'd like any other changes!