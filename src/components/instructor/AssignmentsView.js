import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Button from '@mui/material/Button';
import { SERVER_URL } from '../../Constants';
import UserAdd from "../admin/UserAdd";
import AssignmentAdd from "./AssignmentAdd";
import AssignmentUpdate from "./AssignmentUpdate";
import CourseUpdate from "../admin/CourseUpdate";
import AssignmentGrade from "./AssignmentGrade";

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

    const [editingAssignment, setEditingAssignment] = useState(null);

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

    useEffect(() =>{
        fetchAssignments()
    }, []);

    const handleGrade = (assignmentId) => {
        console.log("Grade assignment", assignmentId);
    };

    const updateAssignment = async (assignment) => {
        console.log("AssignmentView > updateAssignment");
        console.log(assignment);
        try {
            const response = await fetch(`${SERVER_URL}/assignments/${assignment.id}?instructorEmail=dwisneski@csumb.edu`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assignment),
                });
            if (response.ok) {
                const newAssignment = await response.json();
                setMessage("assignment added id="+newAssignment.id);
                await fetchAssignments();
            } else {
                const rc = await response.json();
                setMessage(rc.message);
            }
        } catch (err) {
            setMessage("network error: "+err);
        }
    }

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


    const addAssignment = async (assignment) => {
        // assignment.courseId = courseId;
        // assignment.secId = secId;
        // assignment.secNo = secNo;
        const updatedAssignment = {
            ...assignment,
            courseId: courseId,
            secId: secId,
            secNo: secNo
        };
        try {
            const response = await fetch(`${SERVER_URL}/assignments?instructorEmail=dwisneski@csumb.edu`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedAssignment),
                });
            if (response.ok) {
                const newAssignment = await response.json();
                setMessage("assignment added id="+newAssignment.id);
                await fetchAssignments();
            } else {
                const rc = await response.json();
                setMessage(rc.message);
            }
        } catch (err) {
            setMessage("network error: "+err);
        }
    }

    return (
        <>
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
                        <td><AssignmentGrade assignment={assignment}/></td>
                        <td><AssignmentUpdate assignment={assignment} save={updateAssignment} /></td>
                        <td> <Button variant="outlined" color="error" onClick={() => handleDelete(assignment.id)}>Delete</Button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <AssignmentAdd save={addAssignment} />
        </>
    );
};

export default AssignmentsView;
