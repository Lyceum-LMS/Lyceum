import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid,
    TextField,
    Tab,
    Tabs,
    Box,
    Link,
    Alert
} from '@mui/material';

// student views a list of assignments and assignment grades
// use the URL  /assignments?studentId= &year= &semester=
// The REST api returns a list of SectionDTO objects
// Use a value of studentId=3 for now. Until login is implemented in assignment 7.

// display a table with columns  Course Id, Assignment Title, Assignment DueDate, Score

/**
 * AssignmentsStudentView component
 *
 * Purpose:
 * - Displays a table of assignments and grades for a specific student.
 * - Fetches data from `/assignments?studentId=...&year=...&semester=...`.
 * - Shows course ID, assignment title, due date, and score.
 */

const AssignmentsStudentView = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For now, hardcode the student ID; it will be replaced with the logged-in user's ID in Assignment 7
    const studentId = 3;

    // State variables for year and semester selection
    const [year, setYear] = useState(2025);
    const [semester, setSemester] = useState("Spring");
    const [yearInput, setYearInput] = useState("2025");
    const [semesterInput, setSemesterInput] = useState("Spring");

    // Store suggestions for typos or invalid input
    const [semesterSuggestion, setSemesterSuggestion] = useState(null);
    const [yearSuggestion, setYearSuggestion] = useState(null);

    // State to track which input method the user prefers (0 = dropdown, 1 = manual entry)
    const [inputMethod, setInputMethod] = useState(0);

    // Available years and semesters for selection
    const availableYears = [2023, 2024, 2025, 2026];
    const availableSemesters = ["Fall", "Spring", "Summer"];

    // Current year for validation
    const currentYear = new Date().getFullYear();

    // Get the best match for a misspelled semester
    const getSemesterSuggestion = (input) => {
        if (!input) return null;

        const inputLower = input.toLowerCase();

        // If it's already a valid semester (case insensitive), no need for suggestion
        if (availableSemesters.some(s => s.toLowerCase() === inputLower)) {
            return null;
        }

        // Simple algorithm to find closest match
        let bestMatch = null;
        let bestScore = Infinity;

        for (const validSemester of availableSemesters) {
            const validLower = validSemester.toLowerCase();

            // Calculate Levenshtein distance (string edit distance)
            const distance = levenshteinDistance(inputLower, validLower);

            // If we found a better match
            if (distance < bestScore && distance < 3) { // Only suggest if reasonably close
                bestScore = distance;
                bestMatch = validSemester;
            }
        }

        return bestMatch;
    };

    // Calculate Levenshtein distance between two strings
    const levenshteinDistance = (str1, str2) => {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) {
            track[0][i] = i;
        }

        for (let j = 0; j <= str2.length; j++) {
            track[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator // substitution
                );
            }
        }

        return track[str2.length][str1.length];
    };

    // Validate and suggest corrections for year input
    const validateYear = (yearStr) => {
        // If empty, return early
        if (!yearStr.trim()) return true;

        const yearNum = parseInt(yearStr);

        // Check if it's a valid 4-digit number
        if (!/^\d{4}$/.test(yearStr) || isNaN(yearNum)) {
            return false;
        }

        // Check common typos or unlikely values, but don't update state here
        // Just return validation info that the caller can use to set state once
        let suggestion = null;

        // Check if year is within a reasonable range (10 years past to 10 years future)
        if (yearNum < currentYear - 10 || yearNum > currentYear + 10) {
            suggestion = {
                message: `${yearNum} seems unusual. Are you sure? Years between ${currentYear - 10} and ${currentYear + 10} are typical.`,
                suggestion: null
            };
        }

        // If year is similar to a common typo (e.g., 202 instead of 2022)
        if (/^\d{3}$/.test(yearStr)) {
            const suggestedYear = parseInt(yearStr + "0");
            suggestion = {
                message: `Did you mean ${suggestedYear}?`,
                suggestion: suggestedYear.toString()
            };
            return false;
        }

        // If year is too far in the future
        if (yearNum > currentYear + 100) {
            suggestion = {
                message: `${yearNum} is very far in the future. Did you mean ${currentYear}?`,
                suggestion: currentYear.toString()
            };
        }

        return { isValid: true, suggestion };
    };

    // Check and update semester suggestion when input changes
    const handleSemesterInputChange = (e) => {
        const value = e.target.value;
        setSemesterInput(value);

        // Don't set suggestion directly, get it and then update state
        const suggestion = getSemesterSuggestion(value);
        setSemesterSuggestion(suggestion);
    };

    // Update year input and validate
    const handleYearInputChange = (e) => {
        const value = e.target.value;
        setYearInput(value);

        // Clear previous suggestions first
        setYearSuggestion(null);

        // Only validate non-empty input
        if (value) {
            const result = validateYear(value);

            // If validation returned a suggestion, update state
            if (result && typeof result === 'object' && result.suggestion) {
                setYearSuggestion(result.suggestion);
            }
        }
    };

    // Function to fetch assignments based on selected year and semester
    const fetchAssignments = () => {
        // Use the appropriate values based on input method
        const yearToUse = inputMethod === 0 ? year : parseInt(yearInput);
        let semesterToUse = inputMethod === 0 ? semester : semesterInput;

        // If manual entry, normalize the semester to proper case
        if (inputMethod === 1 && semesterInput) {
            // Find the proper case version if it exists (case-insensitive match)
            const matchedSemester = availableSemesters.find(
                s => s.toLowerCase() === semesterInput.toLowerCase()
            );

            if (matchedSemester) {
                semesterToUse = matchedSemester; // Use the properly cased version
            }
        }

        // Validate year input when using manual entry
        if (inputMethod === 1) {
            // Check if year is a valid 4-digit number
            if (!/^\d{4}$/.test(yearInput) || isNaN(parseInt(yearInput))) {
                setError("Please enter a valid 4-digit year");
                return;
            }

            // Check if semester is valid (case insensitive check)
            const validSemesters = availableSemesters.map(s => s.toLowerCase());
            if (!validSemesters.includes(semesterInput.toLowerCase())) {
                if (semesterSuggestion) {
                    setError(`Invalid semester. Did you mean "${semesterSuggestion}"?`);
                } else {
                    setError("Please enter a valid semester (Fall, Spring, or Summer)");
                }
                return;
            }
        }

        setLoading(true);
        setError(null);

        fetch(`http://localhost:8080/assignments?studentId=${studentId}&year=${yearToUse}&semester=${semesterToUse}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAssignments(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching assignments:', error);
                setError(`Error loading assignments: ${error.message}`);
                setLoading(false);
            });
    };

    // Fetch assignments on initial component mount
    useEffect(() => {
        fetchAssignments();
    }, []); // Empty dependency array means this effect runs once on mount

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchAssignments();
    };

    // Update yearInput and semesterInput when dropdown values change (for consistency)
    useEffect(() => {
        setYearInput(year.toString());
        // Clear any suggestions when switching to dropdown
        setYearSuggestion(null);
    }, [year]);

    useEffect(() => {
        setSemesterInput(semester);
        // Clear any suggestions when switching to dropdown
        setSemesterSuggestion(null);
    }, [semester]);

    // Apply a suggested semester
    const applySemesterSuggestion = () => {
        if (semesterSuggestion) {
            setSemesterInput(semesterSuggestion);
            setSemesterSuggestion(null);
        }
    };

    // Apply a suggested year
    const applyYearSuggestion = () => {
        if (yearSuggestion && yearSuggestion.suggestion) {
            setYearInput(yearSuggestion.suggestion);
            setYearSuggestion(null);
        }
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>My Assignments</Typography>

            {/* Year and Semester Selection Form */}
            <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
                {/* Tab to switch between dropdown and manual entry modes */}
                <Tabs
                    value={inputMethod}
                    onChange={(e, newValue) => setInputMethod(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    style={{ marginBottom: '20px' }}
                >
                    <Tab label="Select from Options" />
                    <Tab label="Manual Entry" />
                </Tabs>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3} alignItems="flex-end">
                        {inputMethod === 0 ? (
                            // Dropdown Selection
                            <>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel id="year-select-label">Year</InputLabel>
                                        <Select
                                            labelId="year-select-label"
                                            id="year-select"
                                            value={year}
                                            label="Year"
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            {availableYears.map(y => (
                                                <MenuItem key={y} value={y}>{y}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel id="semester-select-label">Semester</InputLabel>
                                        <Select
                                            labelId="semester-select-label"
                                            id="semester-select"
                                            value={semester}
                                            label="Semester"
                                            onChange={(e) => setSemester(e.target.value)}
                                        >
                                            {availableSemesters.map(sem => (
                                                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        ) : (
                            // Manual Text Entry
                            <>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Year"
                                        placeholder="Enter year (e.g., 2025)"
                                        value={yearInput}
                                        onChange={(e) => handleYearInputChange(e)}
                                        error={yearInput !== "" && typeof validateYear(yearInput) === 'boolean' && !validateYear(yearInput)}
                                        helperText={yearInput !== "" && typeof validateYear(yearInput) === 'boolean' && !validateYear(yearInput)
                                            ? "Please enter a valid 4-digit year"
                                            : ""}
                                    />
                                    {yearSuggestion && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {yearSuggestion.message}
                                                {yearSuggestion.suggestion && (
                                                    <Link
                                                        component="button"
                                                        variant="caption"
                                                        onClick={applyYearSuggestion}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        Use {yearSuggestion.suggestion}
                                                    </Link>
                                                )}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Semester"
                                        placeholder="Fall, Spring, or Summer"
                                        value={semesterInput}
                                        onChange={(e) => handleSemesterInputChange(e)}
                                        error={semesterInput !== "" &&
                                            !availableSemesters.map(s => s.toLowerCase()).includes(semesterInput.toLowerCase())}
                                        helperText={semesterInput !== "" &&
                                        !availableSemesters.map(s => s.toLowerCase()).includes(semesterInput.toLowerCase())
                                            ? "Please enter Fall, Spring, or Summer"
                                            : ""}
                                    />
                                    {semesterSuggestion && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Did you mean "{semesterSuggestion}"?
                                                <Link
                                                    component="button"
                                                    variant="caption"
                                                    onClick={applySemesterSuggestion}
                                                    sx={{ ml: 1 }}
                                                >
                                                    Use "{semesterSuggestion}"
                                                </Link>
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12} sm={4}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                View Assignments
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {error && (
                <Alert severity="error" style={{ marginBottom: '20px' }}>
                    {error}
                </Alert>
            )}

            <Typography variant="subtitle1" gutterBottom>
                Showing assignments for {inputMethod === 0 ? semester : semesterInput} {inputMethod === 0 ? year : yearInput}
            </Typography>

            {loading ? (
                <Typography>Loading assignments...</Typography>
            ) : assignments.length === 0 ? (
                <Typography variant="body1">You have no assignments for this term.</Typography>
            ) : (
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
                            {assignments.map(assignment => (
                                <TableRow key={assignment.assignmentId}>
                                    <TableCell>{assignment.courseId}</TableCell>
                                    <TableCell>{assignment.title}</TableCell>
                                    <TableCell>{assignment.dueDate}</TableCell>
                                    <TableCell>
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