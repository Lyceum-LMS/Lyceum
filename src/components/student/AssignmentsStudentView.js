import React, { useState, useEffect } from 'react';
// Import MUI components for table UI and layout
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import {SERVER_URL} from "../../Constants";

// student views a list of assignments and assignment grades ✅
// use the URL  /assignments?studentId= &year= &semester= ✅
// The REST api returns a list of SectionDTO objects ✅
// Use a value of studentId=3 for now. Until login is implemented in assignment 7. ✅

// display a table with columns  Course Id, Assignment Title, Assignment DueDate, Score ✅

/**
 * AssignmentsStudentView component
 *
 * Purpose:
 * - Displays a table of assignments and grades for a specific student.
 * - Fetches data from `/assignments?studentId=...&year=...&semester=...`.
 * - Shows course ID, assignment title, due date, and score.
 *
 * Notes:
 * - studentId is hardcoded to 3 until login is implemented in Assignment 7.
 * - Year and semester are also hardcoded for now.
 */
const AssignmentsStudentView = () => {
    // State to store the fetched assignment data
    const [assignments, setAssignments] = useState([]);
    // sls
    const [search, setSearch] = useState({studentId: 3, year:'', semester:''});
    const [message, setMessage] = useState('');

    // State to track loading status
    const [loading, setLoading] = useState(true);

    // Hardcoded student ID (will be replaced with logged-in user later)
    const studentId = 3;

    // Hardcoded academic term
    const year = 2025;
    const semester = "Spring";

    // useEffect triggers the data fetch when the component mounts
    // useEffect(() => {
    //     setLoading(true); // Show loading state before the fetch
    //
    //     // Call the backend API to get student assignments
    //     fetch(`http://localhost:8080/assignments?studentId=${studentId}&year=${year}&semester=${semester}`)
    //         .then(response => {
    //             if (!response.ok) {
    //                 // Handle non-2xx responses
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json(); // Parse JSON response
    //         })
    //         .then(data => {
    //             setAssignments(data); // Store the fetched assignments
    //             setLoading(false);    // End loading state
    //         })
    //         .catch(error => {
    //             console.error('Error fetching assignments:', error);
    //             setLoading(false);    // End loading even on error
    //         });
    // }, [studentId, year, semester]); // Dependencies: only refetch if these change

    // While loading, show a message
    // if (loading) {
    //     return <Typography>Loading assignments...</Typography>;
    // }

    // sls
    const editChange = (event) => {
        setSearch({...search,  [event.target.name]:event.target.value});
    }
    const fetchAssignments = async () => {
        if (search.studentId==='' | search.year==='' || search.semester==='' ) {
            setMessage("Enter search parameters");
        } else {
            try {
                const response = await fetch(`${SERVER_URL}/assignments?studentId=${search.studentId}&year=${search.year}&semester=${search.semester}`);
                if (response.ok) {
                    const data = await response.json();
                    setAssignments(data);
                } else {
                    const rc = await response.json();
                    setMessage(rc.message);
                }
            } catch(err) {
                setMessage("network error: "+err);
            }
        }
    }

    return (
        <div>
            {/*<h3>Assignments</h3>*/}
            <h4>{message}</h4>
            <h4>Enter year, semester.  Example  2025 Spring</h4>
            <table className="Center">
                <tbody>
                <tr>
                    <td>Year:</td>
                    <td><input type="text" id="syear" name="year" value={search.year} onChange={editChange} /></td>
                </tr>
                <tr>
                    <td>Semester:</td>
                    <td><input type="text" id="ssemester" name="semester" value={search.semester} onChange={editChange} /></td>
                </tr>
                </tbody>
            </table>
            <br/>
            <button id="search" type="submit" onClick={fetchAssignments} >Search for Assignments</button>
            <br/>
            <br/>
            {/* Heading */}
            <Typography variant="h4" gutterBottom>My Assignments</Typography>
            <Typography variant="subtitle1" gutterBottom>{semester} {year}</Typography>

            {/* If no assignments returned, show fallback text */}
            {assignments.length === 0 ? (
                <Typography variant="body1">You have no assignments for this term.</Typography>
            ) : (
                // Table container with assignment rows
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course ID</TableCell>
                                <TableCell>Assignment Title</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Render each assignment as a table row */}
                            {assignments.map(assignment => (
                                <TableRow key={assignment.assignmentId}>
                                    <TableCell>{assignment.courseId}</TableCell>
                                    <TableCell>{assignment.title}</TableCell>
                                    <TableCell>{assignment.dueDate}</TableCell>
                                    <TableCell>
                                        {/* Show score if available, otherwise say "Not graded" */}
                                        {assignment.score !== null
                                            ? assignment.score
                                            : <span style={{ color: 'gray' }}>Not graded</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default AssignmentsStudentView;
