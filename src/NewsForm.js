import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';

const NewsForm = () => {
    const [topic, setTopic] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]); // Initialize as empty array
    const [visibleCount, setVisibleCount] = useState(5);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [customText, setCustomText] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [contentGenerated, setContentGenerated] = useState(false);
    const [templateOptions, setTemplateOptions] = useState([]);

    const [templateChoice, setTemplateChoice] = useState("template1");
    const [userVideo, setUserVideo] = useState(null);
    const [videoGenerated, setVideoGenerated] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
    const [videoLength, setVideoLength] = useState("super_short");
    const [subtitleColor, setSubtitleColor] = useState("white");

    const handleFetchNews = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setArticles([]);
        setResult(null);
        setSelectedArticle(null);
        setVisibleCount(5);
        setCustomText('');
        setContentGenerated(false);

        try {
            const response = await axios.post('https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net/api/fetch-news', { topic });
            const fetchedArticles = response.data;
            setArticles(fetchedArticles);
        } catch (err) {
            setError('Failed to fetch news articles. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const handleGenerateContent = async () => {
        setLoading(true);
        setError(null);

        // Determine whether to use custom text or the selected article
        const articleSummary = customText || selectedArticle?.description;
        if (!articleSummary) {
            setError("Please select an article or enter your own text to generate content.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net/api/generate-content', {
                articleSummary,
                seoKeywords,
                videoLength,  // Add videoLength here as part of the JSON payload
            });
            setResult(response.data);
            setContentGenerated(true);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoGeneration = async () => {
        const formData = new FormData();
        formData.append("template_choice", templateChoice);
        formData.append("script", result.script);
        formData.append("subtitle_color", subtitleColor);
        formData.append("videoLength", videoLength);

        const response = await axios.post('https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net/api/generate-video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob'
        });

        console.log(response.data)
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setGeneratedVideoUrl(url);
        setVideoGenerated(true);
    };

    const handleUploadAndGenerate = async () => {
        if (!userVideo) {
            setError("Please upload a video.");
            return;
        }

        const formData = new FormData();
        formData.append("video", userVideo);

        try {
            const response = await axios.post('https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net/api/upload-video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob'  // To handle the video file response
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setGeneratedVideoUrl(url);
            setVideoGenerated(true);
        } catch (err) {
            setError("Failed to generate video with subtitles.");
        }
    };

    useEffect(() => {
        // Fetch templates from the backend when video length changes
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net/api/templates/${videoLength}`);
                setTemplateOptions(response.data.templates);
                setTemplateChoice(''); // Reset selected template
            } catch (error) {
                console.error('Failed to fetch templates', error);
            }
        };

        if (videoLength) fetchTemplates();
    }, [videoLength]);

    return (
        <Container>
            <h1 className="my-4">AI Shorts/Reels Video Content Generator</h1>
            <Form onSubmit={handleFetchNews}>
                <Form.Group controlId="topic" className="mb-2">
                    <Form.Label className="font-weight-bold">Topic</Form.Label>
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
            </Form>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            {/* Conditionally render articles list if content has not been generated */}
            {articles.length > 0 && !contentGenerated && (
                <div className="mt-4">
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
                                <small>{article.description}</small> <br />
                                <a href={article.url} target="_blank" rel="noopener noreferrer">Read Original News</a>
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
                </div>
            )}

            <Form.Group controlId="customText" className="mt-4">
                <Form.Label>Or Enter Your Own News Text</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter your own news content here..."
                    value={customText}
                    onChange={(e) => {
                        setCustomText(e.target.value);
                        if (e.target.value) setSelectedArticle(null); // Clear selected article if custom text is entered
                    }}
                />
            </Form.Group>

            <Form.Group controlId="seoKeywords" className="my-3">
                <Form.Label>SEO Keywords</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter SEO keywords (comma-separated)"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                />
            </Form.Group>

            <Form.Group controlId="videoLength" className="mb-2">
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

            {result && (
                <div className="mt-4">
                    <h3>Generated Content</h3>
                    <h4>Title: {result.title}</h4>
                    <p><strong>Description:</strong> {result.description}</p>
                    <p><strong>Script:</strong> {result.script}</p>
                    {result.thumbnail && <img src={result.thumbnail} alt="Generated thumbnail" style={{ maxWidth: '100%' }} />}
                </div>
            )}

            <Row className="my-4">
                <Col md={6}>
                    <Form.Group controlId="templateChoice">
                        <Form.Label>Select a Video Template</Form.Label>
                        <Form.Control as="select" value={templateChoice} onChange={(e) => setTemplateChoice(e.target.value)}>
                            <option value="">Select a template</option>
                            {templateOptions.map((template, index) => (
                                <option key={index} value={template}>{template}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="subtitleColor" className="mb-2">
                        <Form.Label>Select Subtitle Color</Form.Label>
                        <Form.Control
                            as="select"
                            value={subtitleColor}
                            onChange={(e) => setSubtitleColor(e.target.value)}
                        >
                            <option value="#fcea8b" style={{ color: "black", backgroundColor: "#fcea8b" }}>🟨 Pastel Yellow</option>
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
                        disabled={!result || loading || !templateChoice}
                    >
                        Generate Video
                    </Button>
                </Col>

                {!videoGenerated &&
                    <Col md={6} className="text-center">
                        <Form.Group controlId="userVideo" className="mb-2">
                            <Form.Label>Upload Your Own Video To Generate Subtitles</Form.Label>
                            <Form.Control type="file" onChange={(e) => setUserVideo(e.target.files[0])} />
                        </Form.Group>
                        <Button
                            variant="primary"
                            className="mb-5"
                            onClick={handleUploadAndGenerate}
                            disabled={!result || loading}
                        >
                            Upload Video
                        </Button>
                    </Col>
                }

                <Col md={6} className="text-center">
                    {videoGenerated && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <a
                                href={generatedVideoUrl}
                                download="generated-video.mp4"
                                className="btn btn-primary mb-3" // Using Bootstrap margin class
                            >
                                Download Video
                            </a>

                            <video
                                className="mb-4"
                                src={generatedVideoUrl}
                                controls
                                style={{ width: '100%', maxWidth: '300px' }}
                            />
                        </div>
                    )}
                </Col>

                {videoGenerated &&
                    <Col md={6} >
                        <Form.Group controlId="userVideo" className="mb-2">
                            <Form.Label>Upload Your Own Video To Generate Subtitles</Form.Label>
                            <Form.Control type="file" onChange={(e) => setUserVideo(e.target.files[0])} />
                        </Form.Group>
                        <Button
                            variant="primary"
                            className="mb-5"
                            onClick={handleUploadAndGenerate}
                            disabled={!result || loading}
                        >
                            Upload Video
                        </Button>
                    </Col>
                }
            </Row>
        </Container>
    );
};

export default NewsForm;
