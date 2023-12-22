import { Cache } from '../../assets/cache/Cache';
import { TextStyle } from '../text/TextStyle';
import { DynamicBitmapFont } from './DynamicBitmapFont';
import { getBitmapTextLayout } from './utils/getBitmapTextLayout';
import { resolveCharacters } from './utils/resolveCharacters';

import type { TextStyleOptions } from '../text/TextStyle';
import type { BitmapFontInstallOptions } from './AbstractBitmapFont';
import type { BitmapFont } from './BitmapFont';
import type { BitmapTextLayoutData } from './utils/getBitmapTextLayout';

class BitmapFontManagerClass
{
    /**
     * This character set includes all the letters in the alphabet (both lower- and upper- case).
     * @type {string[][]}
     * @example
     * BitmapFont.from('ExampleFont', style, { chars: BitmapFont.ALPHA })
     */
    public readonly ALPHA = [['a', 'z'], ['A', 'Z'], ' '];

    /**
     * This character set includes all decimal digits (from 0 to 9).
     * @type {string[][]}
     * @example
     * BitmapFont.from('ExampleFont', style, { chars: BitmapFont.NUMERIC })
     */
    public readonly NUMERIC = [['0', '9']];

    /**
     * This character set is the union of `BitmapFont.ALPHA` and `BitmapFont.NUMERIC`.
     * @type {string[][]}
     */
    public readonly ALPHANUMERIC = [['a', 'z'], ['A', 'Z'], ['0', '9'], ' '];

    /**
     * This character set consists of all the ASCII table.
     * @member {string[][]}
     * @see http://www.asciitable.com/
     */
    public readonly ASCII = [[' ', '~']];

    public defaultOptions: BitmapFontInstallOptions = {
        chars: this.ALPHANUMERIC,
        resolution: 1,
        padding: 4,
        skipKerning: false,
    };

    public getFont(text: string, style: TextStyle): BitmapFont
    {
        let fontFamilyKey = `${style.fontFamily as string}-bitmap`;
        let overrideFill = true;

        // assuming there is no texture we can use a tint!
        if (style._fill.fill)
        {
            fontFamilyKey += style._fill.fill.uid;
            overrideFill = false;
        }

        // first get us the the right font...
        if (!Cache.has(fontFamilyKey))
        {
            const fnt = new DynamicBitmapFont({
                style,
                overrideFill,
                ...this.defaultOptions,
            });

            fnt.once('destroy', () => Cache.remove(fontFamilyKey));

            Cache.set(
                fontFamilyKey as string,
                fnt
            );
        }

        const dynamicFont = Cache.get(fontFamilyKey);

        (dynamicFont as DynamicBitmapFont).ensureCharacters?.(text);

        return dynamicFont;
    }

    public getLayout(text: string, style: TextStyle): BitmapTextLayoutData
    {
        const bitmapFont = this.getFont(text, style);

        return getBitmapTextLayout(text.split(''), style, bitmapFont);
    }

    public measureText(text: string, style: TextStyle): { width: number; height: number; scale: number; offsetY: number }
    {
        return this.getLayout(text, style);
    }

    /**
     * Generates a bitmap-font for the given style and character set
     * @param name - The name of the custom font to use with BitmapText.
     * @param textStyle - Style options to render with BitmapFont.
     * @param options - Setup options for font or name of the font.
     * @returns Font generated by style options.
     * @example
     * import { BitmapFontManager, BitmapText } from 'pixi.js';
     *
     * BitmapFontManager.install('TitleFont', {
     *     fontFamily: 'Arial',
     *     fontSize: 12,
     *     strokeThickness: 2,
     *     fill: 'purple',
     * });
     *
     * const title = new Text({ text: 'This is the title', fontFamily: 'TitleFont', renderMode: 'bitmap' });
     */
    public install(name: string, textStyle?: TextStyle | Partial<TextStyleOptions>, options?: BitmapFontInstallOptions)
    {
        if (!name)
        {
            throw new Error('[BitmapFontManager] Property `name` is required.');
        }

        options = { ...this.defaultOptions, ...options };
        const style = textStyle instanceof TextStyle ? textStyle : new TextStyle(textStyle);
        const overrideFill = style._fill.fill !== null && style._fill.fill !== undefined;
        const font = new DynamicBitmapFont({
            style,
            overrideFill,
            skipKerning: options.skipKerning,
            padding: options.padding,
            resolution: options.resolution,
        });
        const flatChars = resolveCharacters(options.chars);

        font.ensureCharacters(flatChars.join(''));

        Cache.set(`${name}-bitmap`, font);

        font.once('destroy', () => Cache.remove(`${name}-bitmap`));

        return font;
    }

    /**
     * Uninstalls a bitmap font from the cache.
     * @param {string} name - The name of the bitmap font to uninstall.
     */
    public uninstall(name: string)
    {
        const cacheKey = `${name}-bitmap`;
        const font = Cache.get<BitmapFont>(cacheKey);

        if (font)
        {
            Cache.remove(cacheKey);
            font.destroy();
        }
    }
}

export const BitmapFontManager = new BitmapFontManagerClass();
