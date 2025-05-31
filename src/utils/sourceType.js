export const getSourceType = (sourceUrl) => {
  if (sourceUrl.startsWith('http')) {
    if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
      return 'youtube';
    } else if (sourceUrl.includes('drive.google.com')) {
      return 'google-drive';
    } else {
      return 'http';
    }
  } else {
    return 'local';
  }
};