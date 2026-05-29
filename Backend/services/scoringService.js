export function calculateScore(aiData) {
    let score = 0;

    const totalSkills =
        (aiData.skills_match?.length || 0) +
        (aiData.missing_skills?.length || 0);

    const skillScore = totalSkills
        ? (aiData.skills_match.length / totalSkills) * 50
        : 0;

    let expScore = 0;
    if (aiData.experience_years >= 3) expScore = 20;
    else if (aiData.experience_years >= 1) expScore = 10;

    let eduScore = 0;
    if (aiData.education?.toLowerCase().includes("computer")) {
        eduScore = 10;
    }

    const aiScore = (aiData.score_hint || 50) * 0.2;

    score = skillScore + expScore + eduScore + aiScore;

    return Math.round(score);
}