import React, { useState, useEffect } from 'react';
// Import MUI components for table UI and layout
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

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

    // State to track loading status
    const [loading, setLoading] = useState(true);

    // Hardcoded student ID (will be replaced with logged-in user later)
    const studentId = 3;

    // Hardcoded academic term
    const year = 2025;
    const semester = "Spring";

    // useEffect triggers the data fetch when the component mounts
    useEffect(() => {
        setLoading(true); // Show loading state before the fetch

        // Call the backend API to get student assignments
        fetch(`http://localhost:8080/assignments?studentId=${studentId}&year=${year}&semester=${semester}`)
            .then(response => {
                if (!response.ok) {
                    // Handle non-2xx responses
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse JSON response
            })
            .then(data => {
                setAssignments(data); // Store the fetched assignments
                setLoading(false);    // End loading state
            })
            .catch(error => {
                console.error('Error fetching assignments:', error);
                setLoading(false);    // End loading even on error
            });
    }, [studentId, year, semester]); // Dependencies: only refetch if these change

    // While loading, show a message
    if (loading) {
        return <Typography>Loading assignments...</Typography>;
    }

    return (
        <div>
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
