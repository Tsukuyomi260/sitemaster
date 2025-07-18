import React, { useState } from 'react';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Identifiants fictifs
  const fakeStudent = { username: 'etudiant', password: 'test123', name: 'AVOCE Elodie' };

  const handleLogin = (username: string, password: string) => {
    if (username === fakeStudent.username && password === fakeStudent.password) {
      setIsLoggedIn(true);
      setStudentName(fakeStudent.name);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentName('');
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <StudentDashboard studentName={studentName} onLogout={handleLogout} />
      ) : (
        <LoginInterface onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;