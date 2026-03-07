---
name: blogger-stock-analysis
description: Monitor bloggers' content from YouTube, Xiaohongshu, and WeChat public accounts and extract mentioned stocks. USE FOR: analyzing financial content from specific bloggers; extracting stock symbols from articles, videos, and posts; building investment monitoring dashboards; identifying investment themes in social media content.
---

# Blogger Stock Analysis Skill

## Overview
This skill automates the process of monitoring specified bloggers across multiple platforms (YouTube, Xiaohongshu, WeChat) and extracting any stocks or investment-related mentions from their recent content.

## Workflow Steps

1. **Input Collection**
   - Gather blogger profiles/URLs for each platform
   - Define content types to monitor (videos, articles, posts)
   - Set time range for content analysis (e.g., last 30 days)

2. **Content Fetching**
   - For YouTube: Fetch video descriptions and titles from the channel
   - For Xiaohongshu: Scrape recent posts and articles from the user profile
   - For WeChat: Access public account articles via provided links

3. **Content Analysis**
   - Search for stock symbols using regex patterns:
     - US stocks: $[A-Z]{1,5} or [A-Z]{1,5}
     - Chinese stocks: \d{6}\.(SH|SZ) or [0-9]{6}
     - Company names and ticker mentions
   - Extract context around mentions for validation

4. **Data Processing**
   - Deduplicate stock mentions
   - Categorize by platform and content type
   - Generate summary report

5. **Output Generation**
   - List all unique stocks found
   - Provide source links and context
   - Suggest integration points for BloggerView component

## Tools Used
- fetch_webpage: For retrieving web content from platforms
- grep_search: For pattern matching stock symbols in fetched content
- semantic_search: For finding investment-related discussions

## Integration
Results can be integrated into the BloggerView.vue component to display monitored stocks with real-time updates.

## Example Usage
/analyze-blogger-stocks --youtube "https://www.youtube.com/@HenrySlowFIRE/videos" --xiaohongshu "https://www.xiaohongshu.com/user/profile/61ba0abd0000000010008ffa" --wechat "所有的烦恼都源于你穷"</content>
<parameter name="filePath">d:\money\web\web3\.github\skills\blogger-stock-analysis\SKILL.md