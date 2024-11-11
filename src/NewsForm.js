import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';

const NewsForm = () => {
    const [topic, setTopic] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [visibleCount, setVisibleCount] = useState(2);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [customText, setCustomText] = useState('');
    const [error, setError] = useState(null);
    const [contentGenerated, setContentGenerated] = useState(false);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [templateChoice, setTemplateChoice] = useState("template1");
    const [subtitlePosition, setSubtitlePosition] = useState("center");
    const [userVideo, setUserVideo] = useState(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
    const [customGeneratedVideoUrl, setCustomGeneratedVideoUrl] = useState(null);
    const [videoLength, setVideoLength] = useState("super_short");
    const [subtitleColor, setSubtitleColor] = useState("#ffeb82");
    const [addSubtitles, setAddSubtitles] = useState(false);
    const [add_original_audio, setAddOriginalAudio] = useState(false);
    const [add_original_audio_forcustom, setAddOriginalAudioForCustom] = useState(false);
    const [isProcessingVideo, setIsProcessingVideo] = useState(false);
    const [script, setScript] = useState('');
    const [result, setResult] = useState(null);
    const [isCustomTextVisible, setIsCustomTextVisible] = useState(true);

    const [userCustomVideo, setUserCustomVideo] = useState(null);
    const [userCustomText, setUserCustomText] = useState('');
    const [showCustomSection, setShowCustomSection] = useState(true);
    const [uploadError, setUploadError] = useState(null);
    const path = "http://localhost:5000";
    // const path = "https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net";

    const handleFetchNews = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setArticles([]);
        setResult(null);
        setSelectedArticle(null);
        setVisibleCount(2);
        setCustomText('');
        setContentGenerated(false);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/fetch-news', { headers: { 'Authorization': `Bearer ${token}` }, topic });
            const fetchedArticles = response.data;
            setArticles(fetchedArticles);
            setContentGenerated(true);
        } catch (err) {
            setError('Failed to fetch news articles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomText = () => {
        setIsCustomTextVisible((prev) => !prev);
        if (!isCustomTextVisible) setSelectedArticle(null); // Clear selected article if switching to custom text
    };

    const handleGenerateContent = async () => {
        setLoading(true);
        setError(null);

        // Determine whether to use custom text or the selected articlea
        const articleSummary = customText || selectedArticle?.description;
        if (!articleSummary) {
            setError("Please select an article or enter your own text to generate content.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/generate-content', {
                headers: { 'Authorization': `Bearer ${token}` },
                articleSummary,
                seoKeywords,
                videoLength,  // Add videoLength here as part of the JSON payload
            });
            setResult(response.data);
            setScript(response.data.script)
            setContentGenerated(true);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoGeneration = async () => {
        setIsProcessingVideo(true);  // Start video processing
        const formData = new FormData();
        formData.append("template_choice", templateChoice);
        formData.append("script", script);

        formData.append("videoLength", videoLength);

        formData.append("subtitle_color", subtitleColor);
        formData.append("subtitle_position", subtitlePosition);

        if (add_original_audio) {
            formData.append("add_original_audio", add_original_audio);
        }

        const token = localStorage.getItem('auth_token');
        try {
            const response = await axios.post(path + '/api/generate-video-on-content', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setGeneratedVideoUrl(url);
            // setVideoGenerated(true);
            setShowCustomSection(false);
        } catch (error) {
            setError('Failed to generate video. Please try again.');
        } finally {
            setIsProcessingVideo(false);  // Stop video processing
        }
    };

    const handleUploadAndGenerate = async () => {
        if (!userVideo) {
            setError("Please upload a video.");
            return;
        }
        setIsProcessingVideo(true);  // Start video processing
        const formData = new FormData();
        formData.append("video", userVideo);
        formData.append("subtitle_position", subtitlePosition);
        if (add_original_audio) {
            formData.append("add_original_audio", add_original_audio);
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/upload-video-for-sub-generation', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setGeneratedVideoUrl(url);
            // setVideoGenerated(true);
            setShowCustomSection(false);
        } catch (error) {
            setError("Failed to generate video with subtitles.");
        } finally {
            setIsProcessingVideo(false);  // Stop video processing
        }
    };

    const toggleCustomSection = () => setShowCustomSection(!showCustomSection);

    const handleCustomUpload = async () => {
        setIsProcessingVideo(true);
        if (!userCustomVideo || !userCustomText) {
            setUploadError("Please upload a video and enter custom text.");
            return;
        }
        setUploadError(null);
        const formData = new FormData();
        formData.append("video", userCustomVideo);
        formData.append("custom_text", userCustomText);

        if (add_original_audio_forcustom) {
            formData.append("add_original_audio", add_original_audio_forcustom);
        }

        if (addSubtitles) {
            formData.append('add_subtitles', addSubtitles);
            formData.append('subtitle_position', subtitlePosition);
            formData.append('subtitle_color', subtitleColor);
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/custom-upload-generation', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setCustomGeneratedVideoUrl(url);
            // setVideoGenerated(true);
            setShowCustomSection(false);
        } catch (error) {
            if (error.response?.data instanceof Blob) {
                const blob = error.response.data;
                blob.text().then((text) => {
                    const errorData = JSON.parse(text);
                    const message = errorData.error || 'Failed to upload video with custom text. Please try again.';
                    setUploadError(message);
                }).catch(() => {
                    setUploadError('Failed to upload video with custom text. Please try again.');
                });
            } else {
                setUploadError('Failed to upload video with custom text. Please try again.');
            }
        }
        finally {
            setIsProcessingVideo(false);
        }
    };


    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(
                    `${path}/api/templates/${videoLength}`,
                );
                setTemplateOptions(response.data.templates);
                setTemplateChoice(''); // Сброс выбранного шаблона
            } catch (error) {
                console.error('Failed to fetch templates', error);
            }
        };

        if (videoLength) fetchTemplates();
    }, [videoLength]);


    const handleLogout = () => {
        localStorage.removeItem('auth_token'); // Remove JWT token
        window.location.href = '/'; // Redirect to login page
    };

    useEffect(() => {
        if (generatedVideoUrl) {
            setCustomGeneratedVideoUrl(null);  // Reset custom URL when generated URL is available
        }
    }, [generatedVideoUrl]);

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center my-4">
                <h1 style={{ fontWeight: 'bold' }}>AI Shorts/Reels Video Content Generator</h1>
                <Button variant="outline-secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
            <Row>
                <Col md={6}>
                    <Form onSubmit={handleFetchNews}>
                        <Form.Group controlId="topic" className="mb-2">
                            <Form.Label style={{ fontWeight: 'bold' }}>Topic</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter topic (e.g., technology trends)"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading} className="mb-4">
                            {loading ? <Spinner animation="border" size="sm" /> : "Fetch News"}
                        </Button>

                        {/* SEO Keywords */}
                        <Form.Group controlId="seoKeywords" className="mb-2" style={{ fontWeight: 'bold' }}>
                            <Form.Label>SEO Keywords</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter SEO keywords..."
                                value={seoKeywords}
                                onChange={(e) => setSeoKeywords(e.target.value)}
                            />
                        </Form.Group>

                        {/* Video Length */}
                        <Form.Group controlId="videoLength" className="mb-2" style={{ fontWeight: 'bold' }}>
                            <Form.Label>Select Video Length</Form.Label>
                            <Form.Control as="select" value={videoLength} onChange={(e) => setVideoLength(e.target.value)}>
                                <option value="super_short">Super Short (about 15 sec)</option>
                                <option value="short">Short(about 30 sec)</option>
                                <option value="normal">Normal(about 45 sec)</option>
                            </Form.Control>
                        </Form.Group>
                        <Button
                            variant="success"
                            className="mb-5"
                            onClick={handleGenerateContent}
                            disabled={loading || (!selectedArticle && !customText)}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : "Generate Content"}
                        </Button>
                    </Form>
                </Col>

                {/* Custom Text section on the right */}
                <Col md={6}>
                    {isCustomTextVisible && contentGenerated ? (
                        <>
                            <h4>Select an Article</h4>
                            <ListGroup>
                                {articles.slice(0, visibleCount).map((article, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        active={selectedArticle === article && !customText}
                                        onClick={() => customText === '' && setSelectedArticle(article)}
                                        style={{ cursor: customText ? 'not-allowed' : 'pointer' }}
                                    >
                                        <strong>{article.name}</strong> <br />
                                        <small>{article.description}</small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            {visibleCount < articles.length && (
                                <Button
                                    variant="link"
                                    onClick={() => setVisibleCount(visibleCount + 5)}
                                    className="mt-3"
                                >
                                    Load More
                                </Button>
                            )}
                        </>
                    ) : (
                        <Form.Group controlId="customText" className="mt-4 mt-md-0">
                            <Form.Label style={{ fontWeight: 'bold' }}>Or Enter Your Own News Text</Form.Label>
                            <Form.Label>Please enter more than 3 words, my AI need some context to generate some content!</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={10}
                                placeholder="Enter your own news content here..."
                                value={customText}
                                onChange={(e) => {
                                    setCustomText(e.target.value);
                                    if (e.target.value) setSelectedArticle(null);
                                }}
                            />
                        </Form.Group>
                    )}
                    {/* Switcher to toggle between news selection and custom text */}
                    <Form.Check
                        type="switch"
                        id="custom-text-switch"
                        label={isCustomTextVisible ? "Enter Your Own News Text" : "Select an Article"}
                        checked={!isCustomTextVisible}
                        onChange={toggleCustomText}
                        className="mt-2"
                    />
                </Col>
            </Row>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            {result && (
                <div className="mt-4">
                    <h3>Generated Content</h3>
                    <h4>Title: {result.title}</h4>
                    <p><strong>Description:</strong> {result.description}</p>
                    {/* Editable script field */}
                    <Form.Group controlId="editableScript">
                        <Form.Label><strong>Script:</strong></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                        />
                    </Form.Group>
                    {result.thumbnail && <img src={result.thumbnail} alt="Generated thumbnail" style={{ maxWidth: '100%' }} />}
                </div>
            )}

            {isProcessingVideo && (
                <Alert variant="info" className="mt-3">Processing video, please wait...</Alert>
            )}

            <Row className="my-4">
                <Col md={6}>
                    <Form.Group controlId="templateChoice" className="mb-2">
                        <Form.Label style={{ fontWeight: 'bold' }}>Select a Video Template</Form.Label>
                        <Form.Control as="select" value={templateChoice} onChange={(e) => setTemplateChoice(e.target.value)}>
                            <option value="">Select a template</option>
                            {templateOptions.map((template, index) => (
                                <option key={index} value={template}>{template}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="subtitlePosition" className="mb-2">
                        <Form.Label style={{ fontWeight: 'bold' }}>Select Subtitles Position</Form.Label>
                        <Form.Control as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="add_original_audio" className="mb-2">
                        <Form.Check
                            type="checkbox"
                            label="Save Original Audio"
                            checked={add_original_audio}
                            onChange={(e) => setAddOriginalAudio(e.target.checked)}
                            style={{ marginRight: '470px' }}
                        />
                    </Form.Group>

                    <Form.Group controlId="subtitleColor" className="mb-2">
                        <Form.Label style={{ fontWeight: 'bold' }}>Select Subtitle Color</Form.Label>
                        <Form.Control
                            as="select"
                            value={subtitleColor}
                            onChange={(e) => setSubtitleColor(e.target.value)}
                        >
                            <option value="#ffeb82" style={{ color: "black", backgroundColor: "#ffeb82" }}>🟨 Pastel Yellow</option>
                            <option value="#ffa3b6" style={{ color: "black", backgroundColor: "#ffa3b6" }}>🟪 Pastel Pink</option>
                            <option value="#9bfaa5" style={{ color: "black", backgroundColor: "#9bfaa5" }}>🟩 Pastel Green</option>
                            <option value="#b1e5fa" style={{ color: "black", backgroundColor: "#b1e5fa" }}>🟦 Pastel Blue</option>
                            <option value="#dcb2f7" style={{ color: "black", backgroundColor: "#dcb2f7" }}>🟪 Pastel Lavender</option>
                            {/* Add more colors as needed */}
                        </Form.Control>
                    </Form.Group>


                    <Button
                        variant="primary"
                        className="mb-5"
                        onClick={handleVideoGeneration}
                        disabled={!result || isProcessingVideo || loading || !templateChoice}
                    >
                        {isProcessingVideo ? <Spinner animation="border" size="sm" /> : "Generate Video"}
                    </Button>
                    <Row>

                        <Col md={12} >
                            <Form.Group controlId="userVideo" className="mb-2">
                                <Form.Label style={{ fontWeight: 'bold' }}>Upload Your Video To Generate and Add Subtitles on it</Form.Label>
                                <p >Video should be in English</p>
                                <Form.Group controlId="subtitlePosition" className="mb-2">
                                    <Form.Label style={{ fontWeight: 'bold' }}>Select Subtitles Position</Form.Label>
                                    <Form.Control as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                                        <option value="bottom">Bottom</option>
                                        <option value="top">Top</option>
                                        <option value="center">Center</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Control type="file" onChange={(e) => setUserVideo(e.target.files[0])} />
                            </Form.Group>
                            <Button
                                variant="primary"
                                className="mb-5"
                                onClick={handleUploadAndGenerate}
                                disabled={!result || isProcessingVideo || loading}
                            >
                                {isProcessingVideo ? <Spinner animation="border" size="sm" /> : "Upload Video"}
                            </Button>
                        </Col>

                    </Row>
                </Col>

                <Col md={6} className="text-center">
                    {showCustomSection ? (
                        <Row className="my-7">
                            <Col md={12} className="text-center">
                                <h1 style={{ fontWeight: 'bold' }}>Super Custom</h1>
                                <Form.Group controlId="userCustomVideo" className="mb-2">
                                    <Form.Label style={{ fontWeight: 'bold' }}>Upload Your Custom Video</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setUserCustomVideo(e.target.files[0])} />
                                </Form.Group>

                                <Form.Group controlId="addSubtitles" className="mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        label="Add Subtitles"
                                        checked={addSubtitles}
                                        onChange={(e) => setAddSubtitles(e.target.checked)}
                                        style={{ marginRight: '508px' }}
                                    />
                                </Form.Group>

                                <Form.Group controlId="add_original_audio_forcustom" className="mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        label="Save Original Audio"
                                        checked={add_original_audio_forcustom}
                                        onChange={(e) => setAddOriginalAudioForCustom(e.target.checked)}
                                        style={{ marginRight: '470px' }}
                                    />
                                </Form.Group>

                                {addSubtitles && (
                                    <>
                                        <Form.Group controlId="subtitlePosition" className="mb-2">
                                            <Form.Label style={{ fontWeight: 'bold' }}>Select Subtitles Position</Form.Label>
                                            <Form.Control as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                                                <option value="bottom">Bottom</option>
                                                <option value="top">Top</option>
                                                <option value="center">Center</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="subtitleColor" className="mb-2">
                                            <Form.Label style={{ fontWeight: 'bold' }}>Select Subtitle Color</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={subtitleColor}
                                                onChange={(e) => setSubtitleColor(e.target.value)}
                                            >
                                                <option value="#ffeb82" style={{ color: "black", backgroundColor: "#ffeb82" }}>🟨 Pastel Yellow</option>
                                                <option value="#ffa3b6" style={{ color: "black", backgroundColor: "#ffa3b6" }}>🟪 Pastel Pink</option>
                                                <option value="#9bfaa5" style={{ color: "black", backgroundColor: "#9bfaa5" }}>🟩 Pastel Green</option>
                                                <option value="#b1e5fa" style={{ color: "black", backgroundColor: "#b1e5fa" }}>🟦 Pastel Blue</option>
                                                <option value="#dcb2f7" style={{ color: "black", backgroundColor: "#dcb2f7" }}>🟪 Pastel Lavender</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </>
                                )}

                                <Form.Group controlId="userCustomText" className="mb-2">
                                    <Form.Label style={{ fontWeight: 'bold' }}>Enter Your Custom Text</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter text to overlay on the video..."
                                        value={userCustomText}
                                        onChange={(e) => setUserCustomText(e.target.value)}
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    className="mb-4"
                                    onClick={handleCustomUpload}
                                    disabled={!userCustomVideo || !userCustomText}
                                >
                                    {isProcessingVideo ? <Spinner animation="border" size="sm" /> : "Upload and Generate"}
                                </Button>

                                {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                            </Col>
                        </Row>
                    ) : (
                        // Generated Video Section
                        <Row className="my-7 text-center">
                            <Col md={12}>
                                <h2>Generated Video</h2>
                                {(customGeneratedVideoUrl || generatedVideoUrl) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <a
                                            href={customGeneratedVideoUrl || generatedVideoUrl}
                                            download="generated-video.mp4"
                                            className="btn btn-primary mb-3"
                                        >
                                            Download Video
                                        </a>
                                        <video
                                            className="mb-4"
                                            src={customGeneratedVideoUrl || generatedVideoUrl}
                                            controls
                                            style={{ width: '100%', maxWidth: '300px' }}
                                        />
                                    </div>
                                )}
                                <Button variant="secondary" onClick={toggleCustomSection}>Back to Super Custom</Button>
                            </Col>
                        </Row>
                    )}
                </Col>

            </Row>
        </Container>
    );
};

export default NewsForm;
