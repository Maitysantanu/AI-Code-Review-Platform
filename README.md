# RepoMind

**AI-Powered GitHub Repository Analysis, Job Description Matching, and
Interactive Project Learning Platform**

RepoMind is an AI-assisted web application that helps developers and
students understand, analyze, and learn from their own GitHub
repositories. It combines multi-language source-code parsing, static
analysis, hybrid information retrieval, and Large Language Models
(LLMs).

## Table of Contents

-   [Features](#features)
-   [Architecture](#architecture)
-   [Technology Stack](#technology-stack)
-   [How It Works](#how-it-works)
-   [Configuration](#configuration)
-   [Project Structure](#project-structure)
-   [Prerequisites](#prerequisites)
-   [Installation and Setup](#installation-and-setup)
-   [API Endpoints](#api-endpoints)
-   [Testing](#testing)
-   [Security](#security)
-   [Limitations](#limitations)
-   [Future Enhancements](#future-enhancements)
-   [Author](#author)

## Features

### 1. Repository Analysis

-   Accepts a GitHub repository URL.
-   Retrieves repository metadata, file structure, and source files
    through the GitHub API.
-   Uses Tree-sitter grammars configured for multiple programming
    languages.
-   Traverses syntax trees to extract structural information such as
    functions and classes.
-   Calculates configured code-structure indicators, including
    cyclomatic-complexity indicators where implemented.
-   Combines static-analysis information with LLM-assisted review.
-   Presents potential issues, explanations, and improvement
    suggestions.

### 2. Job Description Matching

-   Accepts a job description from the user.
-   Identifies technologies and skills represented in the repository.
-   Extracts technical requirements from the supplied job description.
-   Compares repository skills with job requirements.
-   Highlights matching and missing or less-represented skills.

This is an informational project-to-job-description comparison, not an
automated hiring, candidate-ranking, or shortlisting system.

### 3. Interactive Project Learning

-   Processes repository source code into retrievable chunks.
-   Uses Sentence Transformers to create semantic embeddings.
-   Uses BM25 for keyword-based retrieval.
-   Combines lexical and semantic retrieval to find relevant source-code
    context.
-   Sends retrieved context and the user's question to the configured
    Groq-hosted LLM.
-   Returns a repository-grounded explanation.

> AI-generated findings are suggestions, not a guarantee that every
> defect or vulnerability has been detected. Review findings before
> changing a codebase.

## Architecture

RepoMind uses a modular, multi-tier architecture with a React frontend,
a Java Spring Boot application backend, a Python FastAPI AI service, and
a MySQL database.

``` text
                         +---------------------------+
                         |       React + Vite        |
                         |        Frontend           |
                         +-------------+-------------+
                                       |
                                 REST / JSON
                                       |
                         +-------------v-------------+
                         |     Spring Boot Backend   |
                         |          Java 21          |
                         +------+---------------+----+
                                |               |
                          AI requests       Persistence
                                |               |
                    +-----------v----+     +----v------+
                    | Python FastAPI |     |  MySQL    |
                    |   AI Service   |     | Database |
                    +------+---------+     +-----------+
                           |
                 +---------+----------+
                 |                    |
          +------v------+      +------v------+
          |  GitHub API |      |  Groq Cloud |
          | Repository  |      |     LLM     |
          |   files     |      |  Inference  |
          +-------------+      +-------------+
```

### Request flow

1.  The user performs an operation in the React frontend.
2.  The frontend sends an HTTP request to Spring Boot.
3.  Spring Boot handles application-level processing and forwards
    AI-related requests to FastAPI.
4.  The Python service retrieves repository content from GitHub when
    required.
5.  The AI service performs parsing, analysis, retrieval, or LLM
    inference.
6.  The result is returned to Spring Boot.
7.  Spring Boot returns the response to the frontend and manages
    persistent application records through MySQL where applicable.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React 18                Component-based user
                                                  interface

  Frontend tooling        Vite                    Development and build
                                                  tooling

  Routing                 React Router 6          Client-side navigation

  Icons                   Lucide React            Interface icons

  Styling                 Custom CSS              Application styling

  Main backend            Java 21                 Application backend

  Backend framework       Spring Boot 3.4.2       REST APIs and
                                                  application logic

  Persistence             Spring Data JPA         Java-side database
                                                  access

  Database                MySQL                   Persistent application
                                                  data

  AI service              Python 3.10+            Repository and AI
                                                  processing

  AI API framework        FastAPI                 Python service
                                                  endpoints

  Source parsing          Tree-sitter             Multi-language syntax
                                                  parsing

  Embeddings              Sentence Transformers   Semantic vector
                                                  representations

  Embedding model         `all-MiniLM-L6-v2`      384-dimensional
                                                  embeddings

  Lexical retrieval       BM25                    Keyword-based ranking

  LLM provider            Groq Cloud API          Hosted language-model
                                                  inference

  Configured LLM          `openai/gpt-oss-120b`   AI-assisted review and
                                                  answers

  Repository provider     GitHub API              Repository metadata and
                                                  file retrieval
  -----------------------------------------------------------------------

### Configured language grammars

The parsing engine is configured for eight languages:

-   Python
-   Java
-   JavaScript / JSX
-   TypeScript / TSX
-   C
-   C++
-   Go
-   Rust

Actual parsing coverage depends on the grammars and language-specific
node handling configured in the AI service.

## How It Works

### Repository Analysis

1.  The user submits a GitHub repository URL.
2.  The backend sends the analysis request to the Python service.
3.  The Python service retrieves repository files through the GitHub
    API.
4.  Files are filtered according to configured processing limits.
5.  Tree-sitter parses supported source files and creates syntax trees.
6.  Syntax-tree traversal extracts structural information such as
    functions and classes.
7.  Static-analysis results and selected code context are used in the
    review workflow.
8.  The Groq-hosted LLM generates structured review findings and
    improvement suggestions.
9.  The result is returned to the frontend.

**Tree-sitter note:** Tree-sitter parses source code and exposes
syntax-tree nodes. Additional application logic is responsible for
traversing those nodes and calculating metrics such as cyclomatic
complexity. Tree-sitter alone does not identify every bug or
vulnerability.

### Job Description Matching

1.  The user provides a repository and a job description.
2.  The application identifies technologies and skills represented in
    repository files and source code.
3.  It extracts technical requirements from the job description.
4.  The two sets of information are compared.
5.  The result highlights matching skills and missing or
    less-represented requirements.

### Interactive Project Learning

1.  Repository source code is prepared as smaller chunks.
2.  Sentence Transformers (`all-MiniLM-L6-v2`) generates embeddings for
    the chunks.
3.  BM25 provides keyword-based retrieval.
4.  The user's question is processed for semantic and lexical retrieval.
5.  The retrieval system ranks relevant code chunks.
6.  Selected context is sent with the question to the Groq-hosted LLM.
7.  The LLM generates an explanation based on the retrieved repository
    evidence.

This follows a Retrieval-Augmented Generation (RAG) approach: retrieve
relevant information first, then use it as context for generation.

## Configuration

The AI service uses environment variables to control model generation
and repository-processing limits.

  ------------------------------------------------------------------------
  Variable                             Example value Description
  --------------------- ---------------------------- ---------------------
  `GROQ_MODEL`                 `openai/gpt-oss-120b` Groq model identifier

  `GROQ_MAX_TOKENS`                           `8192` Configured maximum
                                                     generation tokens

  `GROQ_TEMPERATURE`                           `0.2` LLM generation
                                                     temperature

  `MAX_FILES`                                  `120` Maximum repository
                                                     files to process

  `MAX_FILE_BYTES`                          `150000` Maximum individual
                                                     file size, in bytes

  `MAX_TOTAL_BYTES`                        `3500000` Maximum total
                                                     repository content
                                                     size, in bytes

  `MAX_REVIEW_CHUNKS`                            `3` Maximum review chunks
                                                     configured
  ------------------------------------------------------------------------

These are application configuration limits, not guarantees about the
completeness of every analysis. Provider-side model limits and API
quotas may also apply.

## Project Structure

This is a logical example. Adjust directory names to match the actual
checked-in repository structure.

``` text
RepoMind/
|
+-- frontend/                    # React + Vite application
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- context/
|   |   +-- services/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- package.json
|
+-- backend/                     # Java Spring Boot application
|   +-- src/
|   |   +-- main/
|   |   |   +-- java/
|   |   |   +-- resources/
|   |   +-- test/
|   +-- pom.xml
|
+-- python-ai-service/           # Python FastAPI AI service
|   +-- app/
|   |   +-- main.py
|   |   +-- services/
|   |   +-- analyzers/
|   +-- requirements.txt
|
+-- README.md
```

## Prerequisites

Install the following before running the application:

-   Git
-   Node.js and npm
-   JDK 21
-   Maven, or the project's Maven wrapper
-   Python 3.10 or later
-   MySQL Server
-   Groq API key
-   GitHub Personal Access Token when required for repository
    permissions or higher API rate limits

Check installations:

``` bash
git --version
node --version
npm --version
java --version
mvn --version
python --version
```

## Environment Configuration

**Never commit real API keys, access tokens, passwords, or production
secrets.** Create local environment files and keep them out of version
control.

### Python AI service

Create a `.env` file in the location from which the Python service loads
environment variables:

``` env
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token

GROQ_MODEL=openai/gpt-oss-120b
GROQ_MAX_TOKENS=8192
GROQ_TEMPERATURE=0.2

MAX_FILES=120
MAX_FILE_BYTES=150000
MAX_TOTAL_BYTES=3500000
MAX_REVIEW_CHUNKS=3
```

-   `GROQ_API_KEY` authenticates requests to Groq.
-   `GITHUB_TOKEN` supports authenticated GitHub API access. Public
    repositories may be accessible without a token, subject to GitHub's
    unauthenticated rate limits.
-   `GROQ_MODEL` selects the configured model.
-   The remaining variables control generation and repository-processing
    limits.

### Spring Boot backend

Configure the database connection and AI-service base URL in
`application.properties` or the appropriate profile-specific
configuration.

Example:

``` properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/repomind
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

python.service.base-url=http://localhost:8001
```

Use the exact property names expected by your backend configuration. If
your project uses environment-variable overrides or a different database
name, retain those actual settings.

Create the database if it does not already exist:

``` sql
CREATE DATABASE repomind;
```

### React frontend

If the API base URL is configured through Vite, create a frontend `.env`
file:

``` env
VITE_API_BASE_URL=http://localhost:8080/api
```

Vite exposes frontend environment variables prefixed with `VITE_` to
browser-side code. Never put secret API keys in frontend environment
variables.

## Installation and Setup

Run each service in a separate terminal.

### 1. Clone the repository

``` bash
git clone https://github.com/Maitysantanu/AI-Code-Review-Platform.git
cd AI-Code-Review-Platform
```

Use the current repository URL if the project has moved or the
repository is private.

### 2. Start MySQL

Start the MySQL server and create the database:

``` sql
CREATE DATABASE repomind;
```

Ensure the username and password in the Spring Boot configuration match
your local MySQL setup.

### 3. Start the Python AI service

``` bash
cd python-ai-service
```

Create and activate a virtual environment.

**Windows PowerShell:**

``` powershell
python -m venv venv
.env\Scripts\Activate.ps1
```

**macOS / Linux:**

``` bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Create the Python service `.env` file, then start FastAPI:

``` bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

FastAPI documentation is normally available at:

``` text
http://localhost:8001/docs
```

### 4. Start the Spring Boot backend

In another terminal:

``` bash
cd backend
mvn spring-boot:run
```

If the repository includes the Maven wrapper, use:

**Windows:**

``` powershell
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**

``` bash
./mvnw spring-boot:run
```

The backend is configured to run at:

``` text
http://localhost:8080
```

### 5. Start the React frontend

In another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. It is commonly:

``` text
http://localhost:5173
```

> If your repository uses different directory names or start commands,
> follow its `package.json`, Maven configuration, and Python entry
> point.

## API Endpoints

The following routes reflect the application interfaces described for
the project. Verify request bodies, response schemas, authentication
requirements, and exact paths against the current source code before
relying on them.

### Spring Boot application backend

Base URL: `http://localhost:8080/api`

  Method   Endpoint                  Purpose
  -------- ------------------------- ------------------------------------
  POST     `/repositories/analyze`   Initiates repository analysis
  POST     `/matching/analyze`       Performs job description matching
  POST     `/learning/ask`           Asks a question about a repository
  GET      `/history/analyses`       Retrieves saved analysis history
  GET      `/history/matches`        Retrieves saved matching history
  GET      `/health`                 Checks backend health

### Python FastAPI AI service

Base URL: `http://localhost:8001`

  Method   Endpoint              Purpose
  -------- --------------------- ---------------------------------------
  POST     `/analyze`            Performs repository analysis
  POST     `/matching/analyze`   Performs job description matching
  POST     `/learning/ask`       Handles repository question answering
  GET      `/health`             Checks AI-service health

OpenAPI documentation is available at `/docs` when enabled by the
FastAPI application.

## How to Use RepoMind

### Repository Analysis

1.  Open RepoMind in your browser.
2.  Navigate to Repository Analysis.
3.  Enter an accessible GitHub repository URL.
4.  Submit the repository for analysis.
5.  Review the generated repository information, code-analysis findings,
    explanations, and suggestions.

### Job Description Matching

1.  Open Job Description Matching.
2.  Provide the repository information required by the interface.
3.  Paste the target job description.
4.  Start the matching process.
5.  Review matching skills and missing or less-represented requirements.

### Interactive Project Learning

1.  Open Interactive Project Learning.
2.  Select or provide the repository as required by the interface.
3.  Enter a question about the project.
4.  Review the answer generated using retrieved repository context.

## Testing

Recommended test areas include:

  -----------------------------------------------------------------------
  Testing area                        Example verification
  ----------------------------------- -----------------------------------
  Repository input validation         Invalid and malformed repository
                                      URLs are handled

  GitHub integration                  Accessible repositories and API
                                      failures are handled

  Source parsing                      Supported source files are parsed
                                      using configured grammars

  AST traversal                       Function and class nodes are
                                      extracted as expected

  Complexity indicators               Configured decision constructs are
                                      counted correctly

  BM25 retrieval                      Relevant keyword-containing chunks
                                      are ranked

  Semantic retrieval                  Conceptually related chunks can be
                                      retrieved

  Hybrid retrieval                    Lexical and semantic results are
                                      combined as implemented

  LLM integration                     API failures and malformed
                                      responses are handled

  Job matching                        Repository skills are compared with
                                      job requirements

  Persistence                         Saved records can be retrieved
                                      through history endpoints

  End-to-end flow                     Frontend, Spring Boot, FastAPI,
                                      external APIs, and database work
                                      together
  -----------------------------------------------------------------------

Only report test cases as passed if they have actually been executed and
verified.

## Security

-   Keep `.env` files out of Git.
-   Use `.gitignore` entries for environment files, virtual
    environments, build output, and local secrets.
-   If an API key or token is accidentally exposed, revoke it and create
    a replacement immediately.
-   Use the minimum GitHub token permissions required.
-   Do not expose Groq or GitHub credentials through frontend code.
-   Validate repository URLs and user-supplied input.
-   Treat repository source code and LLM responses as untrusted input.
-   Do not execute submitted repository code as part of static analysis
    unless a separate, properly isolated execution environment has been
    designed.
-   Avoid logging API keys, tokens, passwords, or sensitive repository
    content.

Example `.gitignore` entries:

``` gitignore
.env
.env.*
!.env.example

venv/
.venv/
__pycache__/
*.py[cod]

node_modules/
dist/
build/

target/
*.log
.idea/
.vscode/
```

Adapt these rules to the actual project structure.

## Known Limitations

-   Repository analysis is bounded by configured file-count and size
    limits.
-   Tree-sitter parsing depends on configured language grammars and
    language-specific node handling.
-   Static analysis cannot detect every runtime error, logical defect,
    or security vulnerability.
-   LLM findings and explanations can be incomplete or incorrect and
    require human review.
-   AI functionality depends on Groq service availability, model
    availability, token limits, and API quotas.
-   GitHub API access is subject to repository permissions and rate
    limits.
-   Hybrid retrieval quality depends on chunking, embedding quality,
    keyword matching, and ranking.
-   Job description matching identifies technical overlap; it does not
    establish a person's complete proficiency or predict hiring
    outcomes.

## Future Enhancements

Potential future improvements include:

-   GitHub Pull Request analysis and review.
-   Additional programming-language grammars and language-specific
    analysis rules.
-   More advanced security and dependency vulnerability checks.
-   Improved retrieval ranking and repository indexing.
-   Background processing for large repositories.
-   Repository change monitoring and notifications.
-   More detailed explanations and source-location references.
-   Cloud deployment and operational monitoring.

## Contributing

Contributions and suggestions are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Make focused changes.
4.  Run relevant tests.
5.  Commit changes with a clear message.
6.  Open a pull request describing the changes.

Do not include credentials, private tokens, or sensitive repository data
in commits or issue reports.

## License

No license has been specified here. Add a `LICENSE` file and update this
section before distributing or reusing the project. Until a license is
added, do not assume that others have permission to reuse the code.

GitHub: [Maitysantanu](https://github.com/Maitysantanu)

Project Repository:
[AI-Code-Review-Platform](https://github.com/Maitysantanu/AI-Code-Review-Platform)

------------------------------------------------------------------------

**RepoMind -- A repository holds the evidence. RepoMind helps you
understand it.**
