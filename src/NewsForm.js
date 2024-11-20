import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import path from './config';
// In App.js or NewsForm.js
import './style.css'; // Make sure the path is correct
import 'bootstrap/dist/css/bootstrap.min.css';



const NewsForm = () => {

    const languagePhrases = {
        "English": "Subscribe and like this video",
        "Russian": "Подписывайся и ставь лайк",
        // Add other languages here as needed
        "Spanish": "Suscríbete y da like a este video",
        "French": "Abonnez-vous et aimez cette vidéo",
    };


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
    const [language, setLanguage] = useState("English");
    const [language_custom, setCustomLanguage] = useState("English");
    const [voiceType, setVoiceType] = useState(null);
    const [voiceType_custom, setCustomVoiceType] = useState(null);
    const [timestamp_granularities, setTimestampGranularities] = useState("word");
    const [font_size, setFontSize] = useState(30);
    const [font_name, setFontName] = useState("Anton");
    const [likeSubscribe, setLikeSubscribe] = useState();

    const [isKeywordInput, setIsKeywordInput] = useState(true); // Switch between keywords and custom text
    const [keywords, setKeywords] = useState('');
    const [twitterCustomText, setTwitterCustomText] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [customImage, setCustomImage] = useState(null);

    const [audioFile, setAudioFile] = useState(null);
    const [addHook, setAddHook] = useState(true);



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
        if (!isCustomTextVisible) setSelectedArticle(null);
    };

    const handleGenerateContent = async () => {
        setLoading(true);
        setError(null);

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
                videoLength,
                language,
                font_size,
                font_name,
                addHook
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
        setIsProcessingVideo(true);
        const formData = new FormData();
        formData.append("template_choice", templateChoice);
        formData.append("script", script);

        formData.append("videoLength", videoLength);

        formData.append("subtitle_color", subtitleColor);
        formData.append("subtitle_position", subtitlePosition);

        formData.append("language", language);
        formData.append("voice_type", voiceType);
        formData.append("timestamp_granularities", timestamp_granularities);
        formData.append("font_size", font_size);
        formData.append("font_name", font_name);

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
            setShowCustomSection(false);
        } catch (error) {
            setError('Failed to generate video. Please try again.');
        } finally {
            setIsProcessingVideo(false);
        }
    };

    const handleSubsVideoSubmission = async () => {
        if (!userVideo) {
            setError("Please choose file!");
            return;
        }
        setIsProcessingVideo(true);
        const formData = new FormData();
        formData.append("video", userVideo);
        formData.append("subtitle_position", subtitlePosition);
        formData.append("timestamp_granularities", timestamp_granularities);
        formData.append("font_size", font_size);
        formData.append("font_name", font_name);

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
            setShowCustomSection(false);
        } catch (error) {
            setError("Failed to generate video with subtitles.");
        } finally {
            setIsProcessingVideo(false);
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
        formData.append("voice_type", voiceType_custom)

        if (add_original_audio_forcustom) {
            formData.append("add_original_audio", add_original_audio_forcustom);
        }

        if (addSubtitles) {
            formData.append('add_subtitles', addSubtitles);
            formData.append('subtitle_position', subtitlePosition);
            formData.append('subtitle_color', subtitleColor);
            formData.append('timestamp_granularities', timestamp_granularities);
            formData.append("font_size", font_size);
            formData.append("font_name", font_name);
        }

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/custom-upload-generation', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setCustomGeneratedVideoUrl(url);
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

    const toggleInputMethod = () => {
        // When toggling, clear the current input value to prevent mixing them
        if (isKeywordInput) {
            setKeywords('');  // Reset keywords if switching to custom text
        } else {
            setTwitterCustomText('');  // Reset custom text if switching to keywords
        }
        setIsKeywordInput((prev) => !prev);  // Toggle input method
    };

    const handleTextChange = (e) => {
        if (isKeywordInput) {
            setKeywords(e.target.value);  // Update keywords if in keyword input mode
        } else {
            setTwitterCustomText(e.target.value);  // Update custom text if in custom text mode
        }
    };

    const handleTwitterSubmit = async () => {
        const formData = new FormData();
        if (keywords) formData.append('keywords', keywords);
        if (twitterCustomText) formData.append('twitterCustomText', twitterCustomText);
        if (avatar) formData.append('avatar', avatar);
        if (customImage) formData.append('customImage', customImage);
        if (audioFile) formData.append('audioFile', audioFile);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(path + '/api/twitter-generation', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setGeneratedVideoUrl(url);
            setShowCustomSection(false);
        } catch (error) {
            console.error('Error:', error);

        }
    };

    return (
        <Container>
            <Row className="my-3">
                <Col md={12} className="static-color">
                    <h1 >AI Shorts/Reels Video Content Generator</h1>
                    <Button variant="outline-secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Col>
            </Row>
            <Row className="gap-3 mb-3">
                <Col md={4} className="static-color">
                    <Form onSubmit={handleFetchNews}>
                        <Form.Group controlId="topic" className="mb-3">
                            <Form.Label className='custom-label'>Topic</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter topic (e.g., technology trends)"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading} className="mb-2">
                            {loading ? <Spinner animation="border" size="sm" /> : "Fetch News"}
                        </Button>

                        <Form.Group controlId="language" className="mb-3">
                            <Form.Label className='custom-label'>Select Language</Form.Label>
                            <Form.Control as="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="English">English</option>
                                <option value="Russian">Russian</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="seoKeywords" className="mb-2" >
                            <Form.Label className='custom-label'>SEO Keywords</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter SEO keywords..."
                                value={seoKeywords}
                                onChange={(e) => setSeoKeywords(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="videoLength" className="mb-3" >
                            <Form.Label className='custom-label'>Select Video Length</Form.Label>
                            <Form.Control as="select" value={videoLength} onChange={(e) => setVideoLength(e.target.value)}>
                                <option value="super_short">Super Short (about 15 sec)</option>
                                <option value="short">Short(about 30 sec)</option>
                                <option value="normal">Normal(about 45 sec)</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="addHook" className="mb-2">
                            <Form.Check
                                className='custom-check'
                                type="checkbox"
                                label="Add Hook"
                                checked={addHook}
                                onChange={(e) => setAddHook(e.target.checked)}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            className="mb-2"
                            onClick={handleGenerateContent}
                            disabled={loading || (!selectedArticle && !customText)}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : "Generate Content"}
                        </Button>
                    </Form>
                </Col>

                <Col md={7} className="hover-background static-color">
                    {isCustomTextVisible && contentGenerated ? (
                        <>
                            <Form.Label className='custom-label'>Select an Article</Form.Label>
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
                                    onClick={() => setVisibleCount(visibleCount + 2)}
                                    className="mt-3"
                                >
                                    Load More
                                </Button>
                            )}
                        </>
                    ) : (
                        <Form.Group controlId="customText " className="mt-4 mt-md-0">
                            <Form.Label className='custom-label '>Or Enter Your Own News Text</Form.Label>
                            <p>Please enter more than 3 words, my AI need some context to generate some content!</p>
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
                <div className="mt-4 mb-3 hover-background">
                    <h3>Generated Content</h3>
                    <h4>Title: {result.title}</h4>
                    <p><strong>Description:</strong> {result.description}</p>
                    {/* Editable script field */}
                    <Form.Group controlId="editableScript" className="mb-3">
                        <p><strong>Script:</strong></p>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="likeSubscribe" className="mb-2">
                        <Form.Check
                            type="checkbox"
                            label="Like and Subscribe"
                            checked={likeSubscribe}
                            onChange={(e) => {
                                setLikeSubscribe(e.target.checked);

                                // Get the phrase based on the selected language
                                const phrase = languagePhrases[language] || "";

                                // Update the script depending on whether the checkbox is checked or not
                                setScript((prevScript) => {
                                    if (e.target.checked) {
                                        // Add the phrase at the end of the script
                                        return prevScript + " " + phrase;
                                    } else {
                                        // Remove the phrase if it exists
                                        return prevScript.replace(phrase, "").trim();
                                    }
                                });
                            }}
                        />
                    </Form.Group>

                    {result.thumbnail && <img src={result.thumbnail} alt="Generated thumbnail" style={{ maxWidth: '100%' }} />}
                </div>
            )}

            {isProcessingVideo && (
                <Alert variant="info" className="mt-3">Processing video, please wait...</Alert>
            )}

            <Row className="gap-5 mb-2">
                <Col md={5} className="hover-background">
                    <Form.Group controlId="templateChoice" className="mb-2">
                        <Form.Label className='custom-label'>Select a Video Template</Form.Label>
                        <Form.Control className='custom-label' as="select" value={templateChoice} onChange={(e) => setTemplateChoice(e.target.value)}>
                            <option value="">Select a template</option>
                            {templateOptions.map((template, index) => (
                                <option key={index} value={template}>{template}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="voiceSelection" className="mb-3">
                        <Form.Label className='custom-label'>Select Voice Type</Form.Label>
                        <Form.Control as="select" value={voiceType} onChange={(e) => setVoiceType(e.target.value)}>
                            {language === "Russian" ? (
                                <>
                                    <option value="ru-RU-Wavenet-A">ru-RU-Wavenet-A - Female</option>
                                    <option value="ru-RU-Wavenet-C">ru-RU-Wavenet-C - Female</option>
                                    <option value="ru-RU-Wavenet-E">ru-RU-Wavenet-E - Female</option>
                                    <option value="ru-RU-Wavenet-B">ru-RU-Wavenet-B - Male</option>
                                    <option value="ru-RU-Wavenet-D">ru-RU-Wavenet-D - Male</option>
                                </>
                            ) : language === "English" ? (
                                <>
                                    <option value="en-US-Wavenet-F">en-US-Wavenet-F - Female</option>
                                    <option value="en-US-Studio-O">en-US-Studio-O - Female</option>
                                    <option value="en-US-Journey-O">en-US-Journey-O - Female</option>
                                    <option value="en-US-Journey-D">en-US-Journey-D - Male</option>
                                    <option value="en-US-Studio-Q">en-US-Studio-Q - Male</option>
                                    <option value="en-US-Wavenet-B">en-US-Wavenet-B - Male</option>
                                </>
                            ) : (
                                <option value="">Select a language first</option>
                            )}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="subtitleSelection" className="mb-3">
                        <Form.Label className='custom-label'>Select Subtitle Type</Form.Label>
                        <Form.Control
                            as="select"
                            value={timestamp_granularities}
                            onChange={(e) => setTimestampGranularities(e.target.value)}
                        >
                            <option value="word">ADHD</option>
                            <option value="segment">Segment</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="subtitlePosition" className="mb-2">
                        <Form.Label className='custom-label'>Select Subtitles Position</Form.Label>
                        <Form.Control className='custom-label' as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="fontName" className="mb-2">
                        <Form.Label className='custom-label'>Select Font Name</Form.Label>
                        <Form.Control
                            className='custom-label'
                            as="select"
                            value={font_name}
                            onChange={(e) => setFontName(e.target.value)}
                        >
                            <option value="Anton">Anton</option>
                            <option value="Nunito">Nunito</option>
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="fontSize" className="mb-2">
                        <Form.Label className='custom-label'>Select Font Size</Form.Label>
                        <Form.Control
                            className='custom-label'
                            type="number"
                            min="10"
                            max="100"
                            value={font_size}
                            onChange={(e) => setFontSize(e.target.value)}
                            placeholder="Enter font size"
                        />
                    </Form.Group>

                    <Form.Group controlId="add_original_audio" className="mb-2">
                        <Form.Check
                            className='custom-check'
                            type="checkbox"
                            label="Save Original Audio"
                            checked={add_original_audio}
                            onChange={(e) => setAddOriginalAudio(e.target.checked)}
                            style={{ marginRight: '300px' }}
                        />
                    </Form.Group>

                    <Form.Group controlId="subtitleColor" className="mb-3">
                        <Form.Label className='custom-label'>Select Subtitle Color</Form.Label>
                        <Form.Control
                            className='custom-label'
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
                        className="mb-1"
                        onClick={handleVideoGeneration}
                        disabled={!result || isProcessingVideo || loading || !templateChoice}
                    >
                        {isProcessingVideo ? <Spinner animation="border" size="sm" /> : "Generate Video"}
                    </Button>
                </Col>

                <Col md={6} className="text-center hover-background">
                    {showCustomSection ? (
                        <Row className="my-2">
                            <Col md={12} className="text-center">
                                <h2>Super Custom</h2>
                                <Form.Group controlId="userCustomVideo" className="mb-2">
                                    <Form.Label className='custom-label'>Upload Your Custom Video</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setUserCustomVideo(e.target.files[0])} />
                                </Form.Group>

                                <Form.Group controlId="language" className="mb-3">
                                    <Form.Label className='custom-label'>Select Language</Form.Label>
                                    <Form.Control as="select" value={language_custom} onChange={(e) => setCustomLanguage(e.target.value)}>
                                        <option value="English">English</option>
                                        <option value="Russian">Russian</option>
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="voiceSelection" className="mb-3">
                                    <Form.Label className='custom-label'>Select Voice Type</Form.Label>
                                    <Form.Control as="select" value={voiceType_custom} onChange={(e) => setCustomVoiceType(e.target.value)}>
                                        {language_custom === "Russian" ? (
                                            <>
                                                <option value="ru-RU-Wavenet-A">ru-RU-Wavenet-A - Female</option>
                                                <option value="ru-RU-Wavenet-C">ru-RU-Wavenet-C - Female</option>
                                                <option value="ru-RU-Wavenet-E">ru-RU-Wavenet-E - Female</option>
                                                <option value="ru-RU-Wavenet-B">ru-RU-Wavenet-B - Male</option>
                                                <option value="ru-RU-Wavenet-D">ru-RU-Wavenet-D - Male</option>
                                            </>
                                        ) : language_custom === "English" ? (
                                            <>
                                                <option value="en-US-Wavenet-F">en-US-Wavenet-F - Female</option>
                                                <option value="en-US-Studio-O">en-US-Studio-O - Female</option>
                                                <option value="en-US-Journey-O">en-US-Journey-O - Female</option>
                                                <option value="en-US-Journey-D">en-US-Journey-D - Male</option>
                                                <option value="en-US-Studio-Q">en-US-Studio-Q - Male</option>
                                                <option value="en-US-Wavenet-B">en-US-Wavenet-B - Male</option>
                                            </>
                                        ) : (
                                            <option value="">Select a language first</option>
                                        )}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="addSubtitles" className="mb-2">
                                    <Form.Check
                                        className='custom-check'
                                        type="checkbox"
                                        label="Add Subtitles"
                                        checked={addSubtitles}
                                        onChange={(e) => setAddSubtitles(e.target.checked)}
                                        style={{ marginRight: '508px' }}
                                    />
                                </Form.Group>

                                <Form.Group controlId="add_original_audio_forcustom" className="mb-2">
                                    <Form.Check
                                        className='custom-check'
                                        type="checkbox"
                                        label="Save Original Audio"
                                        checked={add_original_audio_forcustom}
                                        onChange={(e) => setAddOriginalAudioForCustom(e.target.checked)}
                                        style={{ marginRight: '460px' }}
                                    />
                                </Form.Group>

                                {addSubtitles && (
                                    <>

                                        <Form.Group controlId="subtitleSelection" className="mb-3">
                                            <Form.Label className='custom-label'>Select Subtitle Type</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={timestamp_granularities}
                                                onChange={(e) => setTimestampGranularities(e.target.value)}
                                            >
                                                <option value="word">ADHD</option>
                                                <option value="segment">Segment</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="subtitlePosition" className="mb-2">
                                            <Form.Label className='custom-label'>Select Subtitles Position</Form.Label>
                                            <Form.Control as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                                                <option value="bottom">Bottom</option>
                                                <option value="top">Top</option>
                                                <option value="center">Center</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="fontName" className="mb-2">
                                            <Form.Label className='custom-label'>Select Font Name</Form.Label>
                                            <Form.Control
                                                className='custom-label'
                                                as="select"
                                                value={font_name}
                                                onChange={(e) => setFontName(e.target.value)}
                                            >
                                                <option value="Anton">Anton</option>
                                                <option value="Nunito">Nunito</option>
                                                <option value="Arial">Arial</option>
                                                <option value="Verdana">Verdana</option>
                                                <option value="Tahoma">Tahoma</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                                <option value="Georgia">Georgia</option>
                                                <option value="Comic Sans MS">Comic Sans MS</option>
                                            </Form.Control>
                                        </Form.Group>

                                        <Form.Group controlId="fontSize" className="mb-2">
                                            <Form.Label className='custom-label'>Select Font Size</Form.Label>
                                            <Form.Control
                                                className='custom-label'
                                                type="number"
                                                min="10"
                                                max="100"
                                                value={font_size}
                                                onChange={(e) => setFontSize(e.target.value)}
                                                placeholder="Enter font size"
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="subtitleColor" className="mb-2">
                                            <Form.Label className='custom-label'>Select Subtitle Color</Form.Label>
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

                                <Form.Group controlId="userCustomText" className="mb-3">
                                    <Form.Label className='custom-label'>Enter Your Custom Text</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter text to overlay on the video..."
                                        value={userCustomText}
                                        onChange={(e) => setUserCustomText(e.target.value)}
                                    />
                                </Form.Group>

                                <div className='mb-3'>
                                    <Form.Text className="text-muted">
                                        {`You inserted ${userCustomText.length} symbols. It is about ${(userCustomText.length / 200 * 10).toFixed(1)} sec. Pay attention to your video length!`}
                                    </Form.Text>
                                </div>

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
            <Row>
                <Col md={5} className="hover-background" >
                    <Form.Group controlId="userVideo" className="mb-3">
                        <h3>Upload Your Video To Generate and Add Subtitles on it</h3>

                        <Form.Group controlId="subtitlePosition" className="mb-2">

                            <Form.Group controlId="subtitleSelection" className="mb-3">
                                <Form.Label className='custom-label'>Select Subtitle Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={timestamp_granularities}
                                    onChange={(e) => setTimestampGranularities(e.target.value)}
                                >
                                    <option value="word">ADHD</option>
                                    <option value="segment">Segment</option>
                                </Form.Control>
                            </Form.Group>



                            <Form.Group controlId="fontName" className="mb-2">
                                <Form.Label className='custom-label'>Select Font Name</Form.Label>
                                <Form.Control
                                    className='custom-label'
                                    as="select"
                                    value={font_name}
                                    onChange={(e) => setFontName(e.target.value)}
                                >
                                    <option value="Anton">Anton</option>
                                    <option value="Nunito">Nunito</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="fontSize" className="mb-2">
                                <Form.Label className='custom-label'>Select Font Size</Form.Label>
                                <Form.Control
                                    className='custom-label'
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={font_size}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    placeholder="Enter font size"
                                />
                            </Form.Group>

                            <Form.Label className='custom-label'>Select Subtitles Position</Form.Label>

                            <Form.Control className='custom-label' as="select" value={subtitlePosition} onChange={(e) => setSubtitlePosition(e.target.value)}>
                                <option value="bottom">Bottom</option>
                                <option value="top">Top</option>
                                <option value="center">Center</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Control type="file" onChange={(e) => setUserVideo(e.target.files[0])} />
                    </Form.Group>
                    <Button
                        variant="primary"
                        className="mb-1"
                        onClick={handleSubsVideoSubmission}
                        disabled={isProcessingVideo || loading}
                    >
                        {isProcessingVideo ? <Spinner animation="border" size="sm" /> : "Upload Video"}
                    </Button>
                </Col>

                <Col md={5} className="hover-background">
                    <h3>Twitter</h3>

                    {/* Avatar upload section */}
                    <Form.Group>
                        <Form.Label>Upload Avatar</Form.Label>
                        <Form.Control type="file" onChange={(e) => setAvatar(e.target.files[0])} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Upload Custom Image</Form.Label>
                        {/* <Form.Control type="file" onChange={handleCustomImageChange} /> */}
                        <Form.Control type="file" onChange={(e) => setCustomImage(e.target.files[0])} />
                    </Form.Group>


                    {/* Switch between keywords or custom text */}
                    <Form.Check
                        type="switch"
                        id="customTextSwitch"
                        label={isKeywordInput ? 'Use Custom Text' : 'Use Keywords'}
                        checked={!isKeywordInput}
                        onChange={toggleInputMethod}
                    />

                    {/* Text input section */}
                    <Form.Group>
                        <Form.Label>{isKeywordInput ? 'Enter Keywords' : 'Enter Custom Text'}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={isKeywordInput ? 'Enter keywords...' : 'Enter custom text...'}
                            value={isKeywordInput ? keywords : twitterCustomText}
                            onChange={handleTextChange}
                        />
                    </Form.Group>

                    {/* Audio upload section */}
                    <Form.Group>
                        <Form.Label>Upload Audio</Form.Label>
                        <Form.Control
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                        />
                    </Form.Group>

                    {/* Button to generate text on the back-end or handle input */}
                    <Button variant="primary" onClick={handleTwitterSubmit}>
                        Generate
                    </Button>
                </Col>
            </Row>
        </Container>


    );
};

export default NewsForm;
