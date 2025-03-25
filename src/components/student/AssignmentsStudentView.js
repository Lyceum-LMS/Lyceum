import React, {useEffect, useState} from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Button from '@mui/material/Button';
import AssignmentsView from "../instructor/AssignmentsView";
import AssignmentAdd from "../instructor/AssignmentAdd";
import {SERVER_URL} from "../../Constants";

// branch fixed
// student views a list of assignments and assignment grades
// use the URL  /assignments?studentId= &year= &semester=
// The REST api returns a list of SectionDTO objects
// Use a value of studentId=3 for now. Until login is implemented in assignment 7.

// display a table with columns  Course Id, Assignment Title, Assignment DueDate, Score

const AssignmentsStudentView = (props) => {

    const headers = ['Course ID', 'Assignment Title', 'Assignment DueDate', 'Score'];
    const[assignments, setAssignments] = useState('');
    const[message,setMessage] = useState('');
    const studentId = 3;
    const year = new Date().getFullYear();
    const semester = 'Fall';

    const fetchAssignments = async () => {
        try{
            const response = await fetch(`${SERVER_URL}/assignments?studentId=${studentId}&year=${year}&semester=${semester}`);
            if (response.ok){
                const data = await response.json();
                setAssignments(data);
            } else {
                const json = await response.json();
                setMessage("response error: " +json.message);
            }
        } catch (err){
            setMessage("network error " +err);
        }
    }
    useEffect(() => {
        fetchAssignments();
    }, []);

    return(
        <div>
            <h3>Assignments</h3>
            <h4>{message}</h4>
            <table className="Center">
                <thead>
                <tr>
                    {headers.map((h,idx) => (<th key={idx}>{h}</th>))}
                </tr>
                </thead>
                <tbody>
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        assignment.assignments.map((item) => (
                            <tr key={item.id}>
                                <td>{assignment.courseId}</td>
                                <td>{item.title}</td>
                                <td>{item.dueDate}</td>
                                <td>{item.score}</td>
                            </tr>
                        ))
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No assignments available</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default AssignmentsStudentView;