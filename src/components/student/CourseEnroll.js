import React, { useState, useEffect } from 'react';
// MUI components for layout and UI elements
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// students displays a list of open sections for a ✅
// use the URL /sections/open ✅
// the REST api returns a list of SectionDTO objects ✅

// the student can select a section and enroll ✅
// issue a POST with the URL /enrollments/sections/{secNo}?studentId=3 ✅
// studentId=3 will be removed in assignment 7. ✅

/**
 * CourseEnroll Component
 *
 * Purpose:
 * - Display a list of open course sections fetched from `/sections/open`.
 * - Allow students to enroll in any of those sections using a POST request.
 *
 * Notes:
 * - The `studentId` is currently hardcoded to 3 until login is implemented in a future assignment.
 * - Displays errors and handles loading states appropriately.
 */
const CourseEnroll = () => {
    // State to store the list of open sections
    const [sections, setSections] = useState([]);

    // State to track loading state
    const [loading, setLoading] = useState(true);

    // State to store any error messages during fetch/enroll
    const [error, setError] = useState(null);

    // Hardcoded student ID (will be dynamic after login is implemented)
    const studentId = 3;

    // Fetch the list of open sections when component mounts
    useEffect(() => {
        fetchOpenSections();
    }, []);

    // Fetch open sections from the backend API
    const fetchOpenSections = () => {
        setLoading(true); // start loading
        fetch(`http://localhost:8080/sections/open`)
            .then(response => {
                console.log("Response status:", response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Received sections data:", data);
                setSections(data); // set the sections state
                setLoading(false); // stop loading
            })
            .catch(error => {
                console.error('Error fetching open sections:', error);
                setError(error.message); // store the error message
                setLoading(false);       // stop loading
            });
    };

    // Handle enrolling in a section
    const enrollCourse = (sectionNo) => {
        console.log("Enrolling in section:", sectionNo);

        // Sanity check on section number
        if (!sectionNo || sectionNo === 'undefined') {
            alert('Invalid section number');
            return;
        }

        // Confirm enrollment from the user
        if (window.confirm(`Are you sure you want to enroll in section ${sectionNo}?`)) {
            fetch(`http://localhost:8080/enrollments/sections/${sectionNo}?studentId=${studentId}`, {
                method: 'POST'
            })
                .then(response => {
                    console.log("Enrollment response status:", response.status);
                    if (!response.ok) {
                        // Parse error message from response JSON
                        return response.json().then(err => {
                            throw new Error(err.message || 'Failed to enroll in course');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Enrollment successful:", data);
                    alert('Successfully enrolled in course');
                    // Refresh section list after enrollment
                    fetchOpenSections();
                })
                .catch(error => {
                    console.error('Error enrolling in course:', error);
                    alert(`Error: ${error.message}`); // Show error to user
                });
        }
    };

    // Show loading message while fetching
    if (loading) {
        return <Typography>Loading available courses...</Typography>;
    }

    // Show error message if something went wrong
    if (error) {
        return (
            <div>
                <Typography variant="h4" gutterBottom>Available Courses for Enrollment</Typography>
                <Typography color="error">Error: {error}</Typography>
                <Typography variant="body2">
                    Please make sure the backend server is running at http://localhost:8080
                </Typography>
            </div>
        );
    }

    return (
        <div>
            {/* Page heading */}
            <Typography variant="h4" gutterBottom>Available Courses for Enrollment</Typography>

            {/* Show message if no sections available */}
            {sections.length === 0 ? (
                <Typography variant="body1">No available sections found for enrollment at this time.</Typography>
            ) : (
                // Display sections in a MUI Table
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course ID</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Times</TableCell>
                                <TableCell>Building</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Instructor</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Loop through all sections and render them in rows */}
                            {sections.map(section => (
                                <TableRow key={section.secNo}>
                                    <TableCell>{section.courseId}</TableCell>
                                    <TableCell>{section.secId}</TableCell>
                                    <TableCell>{section.title}</TableCell>
                                    <TableCell>{section.times}</TableCell>
                                    <TableCell>{section.building}</TableCell>
                                    <TableCell>{section.room}</TableCell>
                                    <TableCell>{section.instructorName}</TableCell>
                                    <TableCell>
                                        {/* Button to trigger enrollment */}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => enrollCourse(section.secNo)}
                                        >
                                            Enroll
                                        </Button>
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

export default CourseEnroll;
