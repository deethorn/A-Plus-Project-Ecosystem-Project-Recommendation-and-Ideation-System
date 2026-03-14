
/**
 * Tokenize and clean text
 */
const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Remove short words
};

/**
 * Calculate term frequency (TF)
 */
const calculateTF = (tokens) => {
  const tf = {};
  const totalTokens = tokens.length;
  
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  
  // Normalize by total tokens
  Object.keys(tf).forEach(token => {
    tf[token] = tf[token] / totalTokens;
  });
  
  return tf;
};

/**
 * Calculate inverse document frequency (IDF)
 */
const calculateIDF = (documents) => {
  const idf = {};
  const totalDocs = documents.length;
  
  // Count documents containing each term
  const docFrequency = {};
  documents.forEach(tokens => {
    const uniqueTokens = [...new Set(tokens)];
    uniqueTokens.forEach(token => {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    });
  });
  
  // Calculate IDF
  Object.keys(docFrequency).forEach(token => {
    idf[token] = Math.log(totalDocs / docFrequency[token]);
  });
  
  return idf;
};

/**
 * Calculate TF-IDF vector for a document
 */
const calculateTFIDF = (tf, idf) => {
  const tfidf = {};
  
  Object.keys(tf).forEach(token => {
    tfidf[token] = tf[token] * (idf[token] || 0);
  });
  
  return tfidf;
};

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
const cosineSimilarity = (vec1, vec2) => {
  // Get all unique terms
  const allTerms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allTerms.forEach(term => {
    const val1 = vec1[term] || 0;
    const val2 = vec2[term] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Find similar projects
 * @param {Object} newProject - The new project to check
 * @param {Array} existingProjects - Array of existing projects
 * @returns {Array} - Array of similar projects with similarity scores
 */
const findSimilarProjects = (newProject, existingProjects) => {
  if (existingProjects.length === 0) {
    return [];
  }
  
  // Combine title and description for comparison
  const newProjectText = `${newProject.title} ${newProject.description}`;
  const newTokens = tokenize(newProjectText);
  
  // Tokenize all existing projects
  const existingTokens = existingProjects.map(project => {
    const text = `${project.title} ${project.description}`;
    return tokenize(text);
  });
  
  // Calculate IDF across all documents (new + existing)
  const allTokens = [newTokens, ...existingTokens];
  const idf = calculateIDF(allTokens);
  
  // Calculate TF-IDF for new project
  const newTF = calculateTF(newTokens);
  const newTFIDF = calculateTFIDF(newTF, idf);
  
  // Calculate similarity with each existing project
  const similarities = existingProjects.map((project, index) => {
    const existingTF = calculateTF(existingTokens[index]);
    const existingTFIDF = calculateTFIDF(existingTF, idf);
    
    const similarity = cosineSimilarity(newTFIDF, existingTFIDF);
    const similarityScore = Math.round(similarity * 100);
    
    return {
      project: project,
      similarityScore: similarityScore
    };
  });
  
  // Filter and sort by similarity (only include > 30% similarity)
  const significantSimilarities = similarities
    .filter(item => item.similarityScore > 30)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5); // Top 5 similar projects
  
  return significantSimilarities;
};

/**
 * Calculate highest duplicate score from similar projects
 */
const calculateDuplicateScore = (similarProjects) => {
  if (similarProjects.length === 0) return 0;
  return similarProjects[0].similarityScore;
};

module.exports = {
  findSimilarProjects,
  calculateDuplicateScore
};
