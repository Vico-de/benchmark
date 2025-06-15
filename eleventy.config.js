import fs from 'fs';
import path from 'path';
import { HtmlBasePlugin } from "@11ty/eleventy";

import cssnano from 'cssnano';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import xlsx from 'xlsx';

const exts = [ "numbers", "xlsx", "xlsb", "xls" ].join(", ");

export default function (eleventyConfig) {
    eleventyConfig.addPlugin(HtmlBasePlugin);

    // compile tailwind before eleventy processes the files
    eleventyConfig.on('eleventy.before', async () => {
        const tailwindInputPath = path.resolve('./src/assets/styles/index.css');
        const tailwindOutputPath = './dist/assets/styles/index.css';

        const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');

        const outputDir = path.dirname(tailwindOutputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const result = await processor.process(cssContent, {
            from: tailwindInputPath,
            to: tailwindOutputPath,
        });

        fs.writeFileSync(tailwindOutputPath, result.css);
    });

    eleventyConfig.addPassthroughCopy("src/assets/img");
    eleventyConfig.addPassthroughCopy("src/assets/scripts");

    // configure xlsx data
    eleventyConfig.addDataExtension(exts, {
        encoding: null, read: true,
        parser: (contents) => {
            const wb = xlsx.read(contents);
            const obj = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
                range: 2
            });
            return obj.filter(v => {
                const name = v["Name"];
                return name !== null && name.trim().length > 0;
            });
        }
    });
    eleventyConfig.addFilter("formatNumber", function(number) {
        return number.toLocaleString("fr-FR")
    });
    eleventyConfig.addGlobalData("images", getPictureIndices());
    eleventyConfig.addGlobalData("imagesExt", getPictureExt());

    const processor = postcss([
        tailwindcss(),
        cssnano({
            preset: 'default',
        }),
    ]);

    return {
        pathPrefix: "/benchmark/",
        dir: { input: 'src', output: 'dist' },
    };
}

function getPictureIndices() {
    const imgDir = path.join('src', 'assets', 'img');
    const files = fs.readdirSync(imgDir);

    const maxIndices = {};

    files.forEach(file => {
        const match = file.match(/^([A-Z]+)(\d+)\.[a-zA-Z]*$/);
        if (match) {
            const [, prefix, index] = match;
            const currentIndex = parseInt(index, 10);

            maxIndices[prefix] = Math.max(
                currentIndex,
                maxIndices[prefix] || 0
            );
        }
    });

    return maxIndices;
}

function getPictureExt() {
    const imgDir = path.join('src', 'assets', 'img');
    const files = fs.readdirSync(imgDir);

    const extensions = {};

    files.forEach(file => {
        const match = file.match(/^(.*)\.(.*)$/);
        if (match) {
            const [, name, ext] = match;
            extensions[name] = ext;
        }
    });

    return extensions;
}
