import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Button from '@mui/material/Button';
import { SERVER_URL } from '../../Constants';

// instructor views assignments for their section
// use location to get the section value
//
// GET assignments using the URL /sections/{secNo}/assignments
// returns a list of AssignmentDTOs
// display a table with columns
// assignment id, title, dueDate and buttons to grade, edit, delete each assignment

const AssignmentsView = (props) => {

    const location = useLocation();
    const { secNo, courseId, secId } = location.state;

    const [assignments, setAssignments] = useState([]);
    const [message, setMessage] = useState('');

    const headers = ['Assignment ID', 'Title', 'Due Date', 'Actions'];

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/sections/${secNo}/assignments?instructorEmail=dwisneski@csumb.edu`);
            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message);
            }
        } catch (err) {
            setMessage("Network error: " + err);
        }
    };

    useEffect(() => {
        const run = async () => {
            await fetchAssignments();
        };
        run();
    }, []);

    const handleGrade = (assignmentId) => {
        console.log("Grade assignment", assignmentId);
    };

    const handleEdit = (assignmentId) => {
        console.log("Edit assignment", assignmentId);
    };

    const deleteAssignment = async (assignmentId) => {
        try {
            const response = await fetch(`${SERVER_URL}/assignments/${assignmentId}?instructorEmail=dwisneski@csumb.edu`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                setMessage("Assignment deleted");
                fetchAssignments();
            } else {
                const errorData = await response.json();
                setMessage(errorData.message);
            }
        } catch (err) {
            setMessage("Network error: " + err);
        }
    };

    const handleDelete = (assignmentId) => {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Do you really want to delete this assignment?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => deleteAssignment(assignmentId),
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    return (
        <div>
            <h2>Assignments for Section #{secNo}</h2>
            <h4>{message}</h4>
            <table className="Center">
                <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                        <td>{assignment.id}</td>
                        <td>{assignment.title}</td>
                        <td>{assignment.dueDate}</td>
                        <td>
                            <Button variant="outlined" onClick={() => handleGrade(assignment.id)}>Grade</Button>
                            <Button variant="outlined" onClick={() => handleEdit(assignment.id)}>Edit</Button>
                            <Button variant="outlined" color="error" onClick={() => handleDelete(assignment.id)}>Delete</Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignmentsView;
