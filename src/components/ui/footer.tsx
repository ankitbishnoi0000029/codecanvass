"use client";
import { Sparkles, Star, Github, Twitter, Youtube, Mail, Heart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const footerSections = [
    {
      title: 'Popular Functionality',
      links: [
        { name: 'JSON Beautifier', href: '/tools/json-beautifier' },
        { name: 'HTML Viewer', href: '/tools/html-viewer' },
        { name: 'Number to Words', href: '/tools/number-to-words' },
        { name: 'SQL Formatter', href: '/tools/sql-formatter' },
        { name: 'Image to Base64', href: '/tools/image-to-base64' },
        { name: 'Base64 to Image', href: '/tools/base64-to-image' },
        { name: 'HEX to Pantone', href: '/tools/hex-to-pantone' },
        { name: 'Source Code Viewer', href: '/tools/source-code-viewer' },
        { name: 'Binary to Text', href: '/tools/binary-to-text' },
        { name: 'JSON Viewer', href: '/tools/json-viewer' },
        { name: 'JSON Validator', href: '/tools/json-validator' },
        { name: 'Base64 Decode', href: '/tools/base64-decode' },
        { name: 'Hex to Decimal', href: '/tools/hex-to-decimal' },
        { name: 'XML Viewer', href: '/tools/xml-viewer' },
        { name: 'XML to JSON', href: '/tools/xml-to-json' },
        { name: 'Encryption-Decryption', href: '/tools/encryption-decryption' },
        { name: 'Excel to HTML', href: '/tools/excel-to-html' },
        { name: 'CSS Validator', href: '/tools/css-validator' },
        { name: 'XML Validator', href: '/tools/xml-validator' },
        { name: 'JavaScript Validator', href: '/tools/javascript-validator' },
        { name: 'CSS Beautifier', href: '/tools/css-beautifier' },
        { name: 'ONLINE JSON EDITOR', href: '/tools/json-editor' },
        { name: 'Decimal to Hex', href: '/tools/decimal-to-hex' },
        { name: 'Binary to Decimal', href: '/tools/binary-to-decimal' },
        { name: 'ASCII to Text', href: '/tools/ascii-to-text' },
        { name: 'Random Emoji Generator', href: '/tools/random-emoji-generator' },
        { name: 'REM to PX Converter', href: '/tools/rem-to-px' },
        { name: 'Incorrect Quotes Generator', href: '/tools/incorrect-quotes' },
        { name: 'Lua Beautifier', href: '/tools/lua-beautifier' }
      ]
    },
    {
      title: 'New Functionality',
      links: [
        { name: 'Flag Maker', href: '/tools/flag-maker' },
        { name: 'Code to ASCII', href: '/tools/code-to-ascii' },
        { name: 'Inches to Pixels', href: '/tools/inches-to-pixels' },
        { name: 'Vertical Font Generator', href: '/tools/vertical-font-generator' },
        { name: 'JSON MultiLine String', href: '/tools/json-multiline-string' },
        { name: 'JWT Decode', href: '/tools/jwt-decode' },
        { name: 'JSON to JSONL Converter', href: '/tools/json-to-jsonl' },
        { name: 'HTML to JSX Converter', href: '/tools/html-to-jsx' },
        { name: 'Markdown Table Generator', href: '/tools/markdown-table-generator' },
        { name: 'Table to HTML Converter', href: '/tools/table-to-html' },
        { name: 'Scoreboard Online', href: '/tools/scoreboard-online' },
        { name: 'Latex Table Generator', href: '/tools/latex-table-generator' },
        { name: 'Cash App Fees Calculator', href: '/tools/cash-app-fees' },
        { name: 'Playback Speed Calculator', href: '/tools/playback-speed' },
        { name: 'TOML to JSON Converter', href: '/tools/toml-to-json' },
        { name: 'JSON to TOML Converter', href: '/tools/json-to-toml' },
        { name: 'TOML Validator', href: '/tools/toml-validator' },
        { name: 'Saiyan Name Generator', href: '/tools/saiyan-name-generator' },
        { name: 'Roman Numeral Tattoo', href: '/tools/roman-numeral-tattoo' },
        { name: 'Random Coloring Pages', href: '/tools/random-coloring-pages' },
        { name: 'Tiefling Name Generator', href: '/tools/tiefling-name-generator' },
        { name: 'Dragonborn Name Generator', href: '/tools/dragonborn-name-generator' },
        { name: 'Cultist Name Generator', href: '/tools/cultist-name-generator' },
        { name: 'Wizard Name Generator', href: '/tools/wizard-name-generator' },
        { name: 'Random Star War Characters', href: '/tools/random-star-wars' },
        { name: 'Animal Fusion Generator', href: '/tools/animal-fusion' },
        { name: 'Random Indiana Address', href: '/tools/random-indiana-address' },
        { name: 'Random Tongue Twister', href: '/tools/random-tongue-twister' },
        { name: 'Random Texas Address', href: '/tools/random-texas-address' },
        { name: 'JSON Sorter', href: '/tools/json-sorter' },
        { name: 'Small Text Generator', href: '/tools/small-text-generator' },
        { name: 'Meme Generator', href: '/tools/meme-generator' },
        { name: 'Yes or No Generator', href: '/tools/yes-or-no' },
        { name: 'Truth or Dare Generator', href: '/tools/truth-or-dare' },
        { name: 'Random Devil Fruit Generator', href: '/tools/random-devil-fruit' },
        { name: 'Random Color Generator', href: '/tools/random-color' },
        { name: 'Random Sports Generator', href: '/tools/random-sports' },
        { name: 'Random Restaurant Generator', href: '/tools/random-restaurant' },
        { name: 'MultiLine to Single Line', href: '/tools/multiline-to-single' },
        { name: 'Random Candy Generator', href: '/tools/random-candy' },
        { name: 'Random Disney Movie Generator', href: '/tools/random-disney-movie' },
        { name: 'Random DC Character Generator', href: '/tools/random-dc-character' },
        { name: 'Marvel Character Generator', href: '/tools/marvel-character' },
        { name: 'Flesch-Kincaid Grade Level', href: '/tools/flesch-kincaid' },
        { name: 'Random Trivia Generator', href: '/tools/random-trivia' },
        { name: 'Random Website Generator', href: '/tools/random-website' },
        { name: 'Random Proverb Generator', href: '/tools/random-proverb' },
        { name: 'Memorable Password Generator', href: '/tools/memorable-password' },
        { name: 'Harry Potter Spells Generator', href: '/tools/harry-potter-spells' },
        { name: 'Random New York Address', href: '/tools/random-ny-address' },
        { name: 'Random Noun Generator', href: '/tools/random-noun' },
        { name: 'Random Spanish Word Generator', href: '/tools/random-spanish-word' },
        { name: 'Random Location Generator', href: '/tools/random-location' },
        { name: 'Random Town Generator', href: '/tools/random-town' },
        { name: 'Goth Name Generator', href: '/tools/goth-name' },
        { name: 'Fantasy Name Generator', href: '/tools/fantasy-name' },
        { name: 'Victorian Name Generator', href: '/tools/victorian-name' },
        { name: 'Magic School Name', href: '/tools/magic-school-name' },
        { name: 'Halloween Costume Generator', href: '/tools/halloween-costume' },
        { name: 'Book Title Generator', href: '/tools/book-title' },
        { name: 'Disney Character Generator', href: '/tools/disney-character' },
        { name: 'God Name Generator', href: '/tools/god-name' },
        { name: 'Random Setting Generator', href: '/tools/random-setting' },
        { name: 'Twitch Name Generator', href: '/tools/twitch-name' },
        { name: 'Villager Name Generator', href: '/tools/villager-name' },
        { name: 'Vampire Name Generator', href: '/tools/vampire-name' },
        { name: 'Dwarf Name Generator', href: '/tools/dwarf-name' },
        { name: 'DND Name Generator', href: '/tools/dnd-name' },
        { name: 'Random Kingdom Name Generator', href: '/tools/random-kingdom' },
        { name: 'Random Japanese Name Generator', href: '/tools/random-japanese-name' },
        { name: 'Random School Name Generator', href: '/tools/random-school-name' },
        { name: 'Glitch Text Generator', href: '/tools/glitch-text' },
        { name: 'YAML Cheat Sheet', href: '/tools/yaml-cheat-sheet' },
        { name: 'JSON Cheat Sheet', href: '/tools/json-cheat-sheet' },
        { name: 'Random Username Generator', href: '/tools/random-username' },
        { name: 'Random Cat Name Generator', href: '/tools/random-cat-name' },
        { name: 'Random Food Generator', href: '/tools/random-food' },
        { name: 'Scenario Generator', href: '/tools/scenario-generator' },
        { name: 'JSON to String', href: '/tools/json-to-string' },
        { name: 'Random New Zealand Address', href: '/tools/random-nz-address' },
        { name: 'Random Paragraph Generator', href: '/tools/random-paragraph' },
        { name: 'Fake ChatGPT Generator', href: '/tools/fake-chatgpt' },
        { name: 'JavaScript Cheat Sheet', href: '/tools/javascript-cheat-sheet' },
        { name: 'Text Formatter', href: '/tools/text-formatter' },
        { name: 'Time Sheet Calculator', href: '/tools/timesheet-calculator' },
        { name: 'Random Video Game Generator', href: '/tools/random-video-game' },
        { name: 'Address in Spain', href: '/tools/spain-address' },
        { name: 'Random Actor Generator', href: '/tools/random-actor' },
        { name: 'Random Song Lyrics', href: '/tools/random-song-lyrics' },
        { name: 'Random Caption Generator', href: '/tools/random-caption' },
        { name: 'Random Celebrity Generator', href: '/tools/random-celebrity' },
        { name: 'Sort XML Online', href: '/tools/sort-xml' },
        { name: 'SVG Viewer', href: '/tools/svg-viewer' },
        { name: 'SVG Formatter', href: '/tools/svg-formatter' },
        { name: 'Cursed Text Generator', href: '/tools/cursed-text' },
        { name: 'Random Superhero Generator', href: '/tools/random-superhero' },
        { name: 'CSS Selectors Cheat Sheet', href: '/tools/css-selectors' },
        { name: 'HEX to RGBA Converter', href: '/tools/hex-to-rgba' },
        { name: 'Sentence Counter', href: '/tools/sentence-counter' },
        { name: 'JSON to One Line', href: '/tools/json-to-oneline' },
        { name: 'Paragraph Counter', href: '/tools/paragraph-counter' },
        { name: 'JavaScript Tester', href: '/tools/javascript-tester' },
        { name: 'Random Pokemon Team Generator', href: '/tools/random-pokemon-team' },
        { name: 'Vim Cheat Sheet', href: '/tools/vim-cheat-sheet' },
        { name: 'Random Canada Address', href: '/tools/random-canada-address' },
        { name: 'Random Pokemon Generator', href: '/tools/random-pokemon' },
        { name: 'Random California Address', href: '/tools/random-california-address' },
        { name: 'Random Movie Generator', href: '/tools/random-movie' },
        { name: 'Character Trait Generator', href: '/tools/character-trait' },
        { name: 'Random Flower Generator', href: '/tools/random-flower' },
        { name: 'Random Quote Generator', href: '/tools/random-quote' },
        { name: 'Random Sentence Generator', href: '/tools/random-sentence' },
        { name: 'Random Element Generator', href: '/tools/random-element' },
        { name: 'Random Planet Generator', href: '/tools/random-planet' },
        { name: 'Random Holiday Generator', href: '/tools/random-holiday' },
        { name: 'Random Last Name Generator', href: '/tools/random-last-name' },
        { name: 'Random Cat Generator', href: '/tools/random-cat' },
        { name: 'Random College Generator', href: '/tools/random-college' },
        { name: 'Random Bird Generator', href: '/tools/random-bird' },
        { name: 'Random Book Generator', href: '/tools/random-book' },
        { name: 'Random Job Generator', href: '/tools/random-job' },
        { name: 'Random Link Generator', href: '/tools/random-link' },
        { name: 'Tweet to Image Converter', href: '/tools/tweet-to-image' },
        { name: 'PSN Name Generator', href: '/tools/psn-name' },
        { name: 'Monster Generator', href: '/tools/monster-generator' },
        { name: 'Random League Champion', href: '/tools/random-league-champion' },
        { name: 'Random Body Part Generator', href: '/tools/random-body-part' },
        { name: 'Social Tools', href: '/tools/social-tools' },
        { name: 'Aesthetic Emoji Generator', href: '/tools/aesthetic-emoji' },
        { name: 'Random Superpower Generator', href: '/tools/random-superpower' },
        { name: 'Random Anime Character', href: '/tools/random-anime-character' },
        { name: 'Random Dinosaur Generator', href: '/tools/random-dinosaur' },
        { name: 'Fursona Generator', href: '/tools/fursona-generator' },
        { name: 'Sims 3 Trait Generator', href: '/tools/sims-3-trait' },
        { name: 'Random Emotion Generator', href: '/tools/random-emotion' },
        { name: 'Random Year Generator', href: '/tools/random-year' },
        { name: 'Random Lorem Character', href: '/tools/random-lorem' },
        { name: 'Random 6 Digit Number', href: '/tools/random-6-digit' },
        { name: 'Random 4 Digit Number', href: '/tools/random-4-digit' },
        { name: 'Random Birthday Generator', href: '/tools/random-birthday' },
        { name: 'Letter Randomizer', href: '/tools/letter-randomizer' },
        { name: 'Text Replacer', href: '/tools/text-replacer' },
        { name: 'Random Tarot Card', href: '/tools/random-tarot' },
        { name: 'Random Dog Breed', href: '/tools/random-dog-breed' },
        { name: 'Random Car Generator', href: '/tools/random-car' },
        { name: 'LOTR Name Generator', href: '/tools/lotr-name' },
        { name: 'Fortune Cookie Generator', href: '/tools/fortune-cookie' },
        { name: 'Random Character Generator', href: '/tools/random-character' },
        { name: 'Instagram Caption Generator', href: '/tools/instagram-caption' },
        { name: 'Snapchat Fonts Generator', href: '/tools/snapchat-fonts' },
        { name: 'Reddit Username Generator', href: '/tools/reddit-username' },
        { name: 'Random Adjectives', href: '/tools/random-adjectives' },
        { name: 'Goofy Ahh Names Generator', href: '/tools/goofy-names' },
        { name: 'Random City Generator', href: '/tools/random-city' },
        { name: 'Personality Generator', href: '/tools/personality-generator' },
        { name: 'Random Girl Name', href: '/tools/random-girl-name' },
        { name: 'Random State Generator', href: '/tools/random-state' },
        { name: 'Full White Screen', href: '/tools/white-screen' },
        { name: 'Full Blue Screen', href: '/tools/blue-screen' },
        { name: 'Full Red Screen', href: '/tools/red-screen' },
        { name: 'Full Black Screen', href: '/tools/black-screen' },
        { name: 'Aesthetic Username', href: '/tools/aesthetic-username' },
        { name: 'Word Replacer', href: '/tools/word-replacer' },
        { name: 'Moodboard Generator', href: '/tools/moodboard' },
        { name: 'Valorant Crosshair', href: '/tools/valorant-crosshair' },
        { name: 'Cookie Run Character', href: '/tools/cookie-run' },
        { name: 'JoJo Stand Generator', href: '/tools/jojo-stand' },
        { name: 'OTP Prompt Generator', href: '/tools/otp-prompt' },
        { name: 'Random Minecraft Block', href: '/tools/random-minecraft-block' },
        { name: 'Random Theme Generator', href: '/tools/random-theme' },
        { name: 'SQL Code Generator', href: '/tools/sql-code-generator' },
        { name: 'Random Pokemon Type', href: '/tools/random-pokemon-type' },
        { name: 'Fake Instagram Post', href: '/tools/fake-instagram' },
        { name: 'Random Aesthetic', href: '/tools/random-aesthetic' },
        { name: 'Random Environment', href: '/tools/random-environment' },
        { name: 'Random Scene Generator', href: '/tools/random-scene' },
        { name: 'XBOX GamerTag', href: '/tools/xbox-gamertag' },
        { name: 'Elf Name Generator', href: '/tools/elf-name' },
        { name: 'Twitter Ratios Generator', href: '/tools/twitter-ratios' },
        { name: 'XBOX Name Generator', href: '/tools/xbox-name' },
        { name: 'Warrior Cat Name', href: '/tools/warrior-cat-name' },
        { name: 'Fake Tweet Generator', href: '/tools/fake-tweet' },
        { name: 'Random Topic Generator', href: '/tools/random-topic' },
        { name: 'Pictionary Word', href: '/tools/pictionary-word' },
        { name: 'Random Things to Draw', href: '/tools/random-things-draw' },
        { name: 'Random Nationality', href: '/tools/random-nationality' },
        { name: 'Random Ethnicity', href: '/tools/random-ethnicity' },
        { name: 'Random Pet Generator', href: '/tools/random-pet' },
        { name: 'Billing Postal Code', href: '/tools/billing-postal-code' },
        { name: 'Random Male Name', href: '/tools/random-male-name' },
        { name: 'Random Boy Name', href: '/tools/random-boy-name' },
        { name: 'Random Things Generator', href: '/tools/random-things' },
        { name: 'Random Milk Term', href: '/tools/random-milk-term' },
        { name: 'Random Zip Code', href: '/tools/random-zip-code' },
        { name: 'Random Team Generator', href: '/tools/random-team' },
        { name: 'Random Billing Address', href: '/tools/random-billing-address' },
        { name: 'Random House Address', href: '/tools/random-house-address' },
        { name: 'Random Street Address', href: '/tools/random-street-address' },
        { name: 'Random Address Generator', href: '/tools/random-address' },
        { name: 'Incorrect Quotes', href: '/tools/incorrect-quotes' },
        { name: 'Random Flag Generator', href: '/tools/random-flag' },
        { name: 'Random Country', href: '/tools/random-country' },
        { name: 'Random US Area Codes', href: '/tools/random-us-area-codes' },
        { name: 'Random Phone Number', href: '/tools/random-phone-number' },
        { name: 'React Formatter', href: '/tools/react-formatter' },
        { name: 'JSON Fixer', href: '/tools/json-fixer' },
        { name: 'JSON Navigator', href: '/tools/json-navigator' },
        { name: 'Random Emoji', href: '/tools/random-emoji' },
        { name: 'Favicon Generator', href: '/tools/favicon-generator' },
        { name: 'CIDR Calculator', href: '/tools/cidr-calculator' },
        { name: 'Marquee Generator', href: '/tools/marquee-generator' },
        { name: 'Meta Tag Generator', href: '/tools/meta-tag-generator' },
        { name: 'Screenshot Beautifier', href: '/tools/screenshot-beautifier' },
        { name: 'Tweet Ideas', href: '/tools/tweet-ideas' },
        { name: 'Number To WhatsApp', href: '/tools/number-to-whatsapp' },
        { name: 'Twitter Header', href: '/tools/twitter-header' },
        { name: 'Twitter Image Downloader', href: '/tools/twitter-image-downloader' },
        { name: 'Random MLB Team', href: '/tools/random-mlb-team' },
        { name: 'Random NBA Team', href: '/tools/random-nba-team' },
        { name: 'Random NCAA Football', href: '/tools/random-ncaa-football' },
        { name: 'Random NCAA Basketball', href: '/tools/random-ncaa-basketball' },
        { name: 'Random IPL Team', href: '/tools/random-ipl-team' },
        { name: 'Random NFL Team', href: '/tools/random-nfl-team' },
        { name: 'Random Object', href: '/tools/random-object' },
        { name: 'Random Animal', href: '/tools/random-animal' },
        { name: 'Random Hobby', href: '/tools/random-hobby' },
        { name: 'Code to Image', href: '/tools/code-to-image' },
        { name: 'Multiple URL Opener', href: '/tools/multiple-url-opener' },
        { name: 'Tweet Beautifier', href: '/tools/tweet-beautifier' },
        { name: 'GIF Viewer', href: '/tools/gif-viewer' },
        { name: 'GIF Splitter', href: '/tools/gif-splitter' },
        { name: 'Share Code Snippets', href: '/tools/share-code' },
        { name: 'Text to Handwriting', href: '/tools/text-to-handwriting' },
        { name: 'Image Beautifier', href: '/tools/image-beautifier' },
        { name: 'SVG to Base64', href: '/tools/svg-to-base64' },
        { name: 'Turbo Search', href: '/tools/turbo-search' },
        { name: 'Text Cleaner', href: '/tools/text-cleaner' },
        { name: 'JSON Cleaner', href: '/tools/json-cleaner' },
        { name: 'JSON to TypeScript', href: '/tools/json-to-typescript' },
        { name: 'Vibration Simulator', href: '/tools/vibration-simulator' },
        { name: 'JSON to PHP Array', href: '/tools/json-to-php' },
        { name: 'IELTS to CLB', href: '/tools/ielts-to-clb' },
        { name: 'Hyperlink Generator', href: '/tools/hyperlink-generator' },
        { name: 'REM to PX', href: '/tools/rem-to-px' },
        { name: 'Facebook Bold Text', href: '/tools/facebook-bold' },
        { name: 'What is My Zodiac Sign', href: '/tools/zodiac-sign' },
        { name: 'Checksum Calculator', href: '/tools/checksum-calculator' },
        { name: 'SOAP Formatter', href: '/tools/soap-formatter' },
        { name: 'WSDL Formatter', href: '/tools/wsdl-formatter' },
        { name: 'JavaScript Pretty Print', href: '/tools/js-pretty-print' },
        { name: 'Visualize JSON Data', href: '/tools/visualize-json' },
        { name: 'Morse Code Translator', href: '/tools/morse-code' },
        { name: 'Alphabetical Order', href: '/tools/alphabetical-order' },
        { name: 'Random Alphanumeric', href: '/tools/random-alphanumeric' },
        { name: 'Hex to UTF8', href: '/tools/hex-to-utf8' },
        { name: 'Byte to String', href: '/tools/byte-to-string' },
        { name: 'UTF8 to ASCII', href: '/tools/utf8-to-ascii' },
        { name: 'Curl to PHP', href: '/tools/curl-to-php' },
        { name: 'Phone Number to IP', href: '/tools/phone-to-ip' },
        { name: 'YAML Parser', href: '/tools/yaml-parser' },
        { name: 'XML Converter', href: '/tools/xml-converter' },
        { name: 'Gzip Decompress', href: '/tools/gzip-decompress' },
        { name: 'HTML Table Generator', href: '/tools/html-table-generator' },
        { name: 'HTML Link Generator', href: '/tools/html-link-generator' },
        { name: 'MP3 to Base64', href: '/tools/mp3-to-base64' },
        { name: 'Base64 to Text', href: '/tools/base64-to-text' },
        { name: 'Base64 to ASCII', href: '/tools/base64-to-ascii' },
        { name: 'STYLUS Compiler', href: '/tools/stylus-compiler' },
        { name: 'JavaScript Obfuscator', href: '/tools/js-obfuscator' },
        { name: 'String to JSON', href: '/tools/string-to-json' },
        { name: 'YAML Pretty Print', href: '/tools/yaml-pretty-print' },
        { name: 'YouTube Thumbnail Grabber', href: '/tools/youtube-thumbnail' }
      ]
    },
    {
      title: 'Trending Tools',
      links: [
        { name: 'Bitwise Calculator', href: '/tools/bitwise-calculator' },
        { name: 'Number Sorter', href: '/tools/number-sorter' },
        { name: 'Remove Punctuation', href: '/tools/remove-punctuation' },
        { name: 'HTML Stripper', href: '/tools/html-stripper' },
        { name: 'Real Time HTML Editor', href: '/tools/html-editor' },
        { name: 'HTML to Markdown', href: '/tools/html-to-markdown' },
        { name: 'Markdown to HTML', href: '/tools/markdown-to-html' },
        { name: 'Lua Minifier', href: '/tools/lua-minifier' },
        { name: 'Lua Beautifier', href: '/tools/lua-beautifier' },
        { name: 'WordPress Password Hash', href: '/tools/wordpress-password' },
        { name: 'Mirror Online', href: '/tools/mirror-online' },
        { name: 'PHP Formatter', href: '/tools/php-formatter' },
        { name: 'Image to ASCII Art', href: '/tools/image-to-ascii' },
        { name: 'SHA256 Hash Generator', href: '/tools/sha256-hash' },
        { name: 'SHA512 Hash Generator', href: '/tools/sha512-hash' },
        { name: 'Excel Viewer', href: '/tools/excel-viewer' },
        { name: 'Paraphrasing Tool', href: '/tools/paraphrasing-tool' },
        { name: 'Word to HTML', href: '/tools/word-to-html' },
        { name: 'CSV to Excel', href: '/tools/csv-to-excel' },
        { name: 'Sharelink Generator', href: '/tools/sharelink-generator' }
      ]
    },
    {
      title: 'Developer Tools',
      links: [
        { name: 'IP Tools', href: '/tools/ip-tools' },
        { name: 'Formatters & Beautifiers', href: '/tools/formatters' },
        { name: 'Image Converter Tools', href: '/tools/image-converters' },
        { name: 'Finance Tools', href: '/tools/finance-tools' },
        { name: 'TSV Tools', href: '/tools/tsv-tools' },
        { name: 'JSON Tools', href: '/tools/json-tools' },
        { name: 'XML Tools', href: '/tools/xml-tools' },
        { name: 'YAML Tools', href: '/tools/yaml-tools' },
        { name: 'HTML Tools', href: '/tools/html-tools' },
        { name: 'CSS Tools', href: '/tools/css-tools' },
        { name: 'JavaScript Tools', href: '/tools/javascript-tools' },
        { name: 'CSV Tools', href: '/tools/csv-tools' },
        { name: 'SQL Tools', href: '/tools/sql-tools' },
        { name: 'Color Tools', href: '/tools/color-tools' },
        { name: 'Unit Tools', href: '/tools/unit-tools' },
        { name: 'Number Tools', href: '/tools/number-tools' },
        { name: 'String Tools', href: '/tools/string-tools' },
        { name: 'Base64 Tools', href: '/tools/base64-tools' },
        { name: 'Random Tools', href: '/tools/random-tools' },
        { name: 'Minifiers', href: '/tools/minifiers' },
        { name: 'Validators', href: '/tools/validators' },
        { name: 'Cryptography', href: '/tools/cryptography' },
        { name: 'Escape Unescape Tools', href: '/tools/escape-unescape' },
        { name: 'UTF Tools', href: '/tools/utf-tools' },
        { name: 'Compress Decompress', href: '/tools/compress-decompress' },
        { name: 'HTML Generators', href: '/tools/html-generators' },
        { name: 'CSS Generators', href: '/tools/css-generators' },
        { name: 'Other Tools', href: '/tools/other-tools' },
        { name: 'Text Style Tools', href: '/tools/text-style' },
        { name: 'CSS Unit Converter Tools', href: '/tools/css-unit-converters' },
        { name: 'POJO Tools', href: '/tools/pojo-tools' },
        { name: 'Twitter Tools', href: '/tools/twitter-tools' },
        { name: 'Random Generators', href: '/tools/random-generators' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/codebeauty' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/codebeauty' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/codebeauty' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@codebeauty.com' }
  ];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <footer className="bg-gradient-to-b from-white via-purple-50/30 to-purple-100/50 border-t border-purple-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Logo and Description - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <Link 
                href="/" 
                className="flex items-center space-x-3 group w-fit"
                aria-label="CodeBeauty - Home"
              >
                <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    CodeBeauty
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Learn. Code. Create.</span>
                </div>
              </Link>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 group"
                    aria-label={`Follow us on ${social.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
           
            {/* Footer Links - Takes 9 columns, divided into sections */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {footerSections.map((section) => {
                const isExpanded = expandedSections[section.title];
                const displayLinks = isExpanded ? section.links : section.links.slice(0, 10);
                
                return (
                  <div key={section.title} className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-base">
                      {section.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {displayLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm font-medium group"
                          >
                            <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                              {link.name}
                            </span>
                          </a>
                        </li>
                      ))}
                      {section.links.length > 10 && (
                        <li>
                          <button
                            onClick={() => toggleSection(section.title)}
                            className="text-purple-600 hover:text-purple-700 font-semibold text-sm inline-flex items-center group"
                          >
                            {isExpanded ? 'Show less' : `View all ${section.links.length} tools`}
                            <ChevronDown 
                              className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : 'rotate-[-90deg]'
                              } group-hover:translate-x-1`}
                            />
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Stay Updated
              </h3>
              <p className="text-gray-600 text-sm">
                Get the latest programming tutorials and tool updates
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                aria-label="Email address"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-bold rounded-r-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>© 2024 CodeBeauty. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors duration-300 group">
                <Star className="w-4 h-4 group-hover:fill-purple-600 transition-all duration-300" />
                <span>Favorites (3)</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>for developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}