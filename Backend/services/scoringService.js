export function calculateScore(aiData) {
    const totalSkills =
        (aiData.skills_match?.length || 0) +
        (aiData.missing_skills?.length || 0);

    const skillScore = totalSkills
        ? ((aiData.skills_match?.length || 0) / totalSkills) * 50
        : 0;

    const experienceYears = Number(aiData.experience_years) || 0;
    let expScore = 0;
    if (experienceYears >= 5) expScore = 20;
    else if (experienceYears >= 3) expScore = 16;
    else if (experienceYears >= 1) expScore = 10;

    let eduScore = 0;
    const education = String(aiData.education || "").toLowerCase();
    if (/(computer|software|information technology|data|engineering|science)/.test(education)) {
        eduScore = 10;
    }

    const scoreHint = Math.max(0, Math.min(100, Number(aiData.score_hint) || 50));
    const aiScore = scoreHint * 0.2;

    const score = skillScore + expScore + eduScore + aiScore;

    return Math.max(0, Math.min(100, Math.round(score)));
}
