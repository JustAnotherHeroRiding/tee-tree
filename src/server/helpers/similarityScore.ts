export const similarityScore = (str1: string, str2: string) => {
    // Simple case-insensitive comparison
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    if (str2.includes(str1)) {
        return 1;
    }

    return 0;
}
