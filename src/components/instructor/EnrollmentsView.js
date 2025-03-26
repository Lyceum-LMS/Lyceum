import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {SERVER_URL} from "../../Constants";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Button from "@mui/material/Button";


// instructor view list of students enrolled in a section
// use location to get section no passed from InstructorSectionsView
// fetch the enrollments using URL /sections/{secNo}/enrollments
// display table with columns
//   'enrollment id', 'student id', 'name', 'email', 'grade'
//  grade column is an input field
//  hint:  <input type="text" name="grade" value={e.grade} onChange={onGradeChange} />

const EnrollmentsView = (props) => {

    const [enrollments, setEnrollments] = useState([]);
    const [message,setMessage] = useState('');
    const location = useLocation();
    const {secNo, courseId, secId} = location.state;

    const fetchEnrollments = async () => {
        if(!secNo) return;
        try {
            const response = await fetch(`${SERVER_URL}/sections/${secNo}/enrollments`);
            if (response.ok) {
                const data = await response.json();
                setEnrollments(data);
            } else {
                const rc = await response.json();
                setMessage(rc.message);
            }
        } catch (err) {
            setMessage("network error" + err);
        }
    }
    useEffect(() => {
        fetchEnrollments();
    }, [] );

    const saveGrades = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/enrollments`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollments)
            });
            if (response.ok) {
                setMessage("Grades saved");
                fetchEnrollments();
            }
            else{
                const rc = await response.json();
                setMessage(rc.message);
            }
        } catch (error) {
            setMessage('network error', error);
        }
    };
    const onGradeChange = (index, event) => {
        const newEnrollments = [...enrollments];
        newEnrollments[index].grade = event.target.value;
        setEnrollments(newEnrollments);
    };

    return(
        <div>
            <h3>{courseId}-{secNo} Enrollments</h3>
            <table className = "Center">
                <thead>
                <tr >
                    <th>Enrollment ID</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Grade</th>
                </tr>
                </thead>
                <tbody>
                {enrollments.map((e, index) => (
                    <tr key={e.enrollmentId}>
                        <td>{e.enrollmentId}</td>
                        <td>{e.studentId}</td>
                        <td>{e.name}</td>
                        <td>{e.email}</td>
                        <td>
                            <input
                                type="text"
                                name="grade"
                                value={e.grade || ''}
                                onChange={(event) => onGradeChange(index, event)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Button color="primary" onClick={saveGrades}>Save Grades</Button>
        </div>
    );
};

export default EnrollmentsView;
