(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                f.code = "MODULE_NOT_FOUND";
                throw f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n || e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        // (c) Dean McNamee <dean@gmail.com>, 2013.
        //
        // https://github.com/deanm/omggif
        //
        // Permission is hereby granted, free of charge, to any person obtaining a copy
        // of this software and associated documentation files (the "Software"), to
        // deal in the Software without restriction, including without limitation the
        // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        // sell copies of the Software, and to permit persons to whom the Software is
        // furnished to do so, subject to the following conditions:
        //
        // The above copyright notice and this permission notice shall be included in
        // all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        // FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        // IN THE SOFTWARE.
        //
        // omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
        // including animation and compression.  It does not rely on any specific
        // underlying system, so should run in the browser, Node, or Plask.

        function GifWriter(buf, width, height, gopts) {
            var p = 0;

            gopts = gopts === undefined ? {} : gopts;
            var loopCount = gopts.loop === undefined ? null : gopts.loop;
            var globalPalette = gopts.palette === undefined ? null : gopts.palette;

            if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
                throw "Width/Height invalid."

            function checkPaletteAndNumColors(palette) {
                var numColors = palette.length;
                if (numColors < 2 || numColors > 256 || numColors & (numColors - 1))
                    throw "Invalid code/color length, must be power of 2 and 2 .. 256.";
                return numColors;
            }

            // - Header.
            buf[p++] = 0x47;
            buf[p++] = 0x49;
            buf[p++] = 0x46; // GIF
            buf[p++] = 0x38;
            buf[p++] = 0x39;
            buf[p++] = 0x61; // 89a

            // Handling of Global Color Table (palette) and background index.
            var gpNumColorsPow2 = 0;
            var background = 0;
            if (globalPalette !== null) {
                var gpNumColors = checkPaletteAndNumColors(globalPalette);
                while (gpNumColors >>= 1) ++gpNumColorsPow2;
                gpNumColors = 1 << gpNumColorsPow2;
                --gpNumColorsPow2;
                if (gopts.background !== undefined) {
                    background = gopts.background;
                    if (background >= gpNumColors) throw "Background index out of range.";
                    // The GIF spec states that a background index of 0 should be ignored, so
                    // this is probably a mistake and you really want to set it to another
                    // slot in the palette.  But actually in the end most browsers, etc end
                    // up ignoring this almost completely (including for dispose background).
                    if (background === 0)
                        throw "Background index explicitly passed as 0.";
                }
            }

            // - Logical Screen Descriptor.
            // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.
            buf[p++] = width & 0xff;
            buf[p++] = width >> 8 & 0xff;
            buf[p++] = height & 0xff;
            buf[p++] = height >> 8 & 0xff;
            // NOTE: Indicates 0-bpp original color resolution (unused?).
            buf[p++] = (globalPalette !== null ? 0x80 : 0) | // Global Color Table Flag.
                gpNumColorsPow2; // NOTE: No sort flag (unused?).
            buf[p++] = background; // Background Color Index.
            buf[p++] = 0; // Pixel aspect ratio (unused?).

            // - Global Color Table
            if (globalPalette !== null) {
                for (var i = 0, il = globalPalette.length; i < il; ++i) {
                    var rgb = globalPalette[i];
                    buf[p++] = rgb >> 16 & 0xff;
                    buf[p++] = rgb >> 8 & 0xff;
                    buf[p++] = rgb & 0xff;
                }
            }

            if (loopCount !== null) { // Netscape block for looping.
                if (loopCount < 0 || loopCount > 65535)
                    throw "Loop count invalid."
                // Extension code, label, and length.
                buf[p++] = 0x21;
                buf[p++] = 0xff;
                buf[p++] = 0x0b;
                // NETSCAPE2.0
                buf[p++] = 0x4e;
                buf[p++] = 0x45;
                buf[p++] = 0x54;
                buf[p++] = 0x53;
                buf[p++] = 0x43;
                buf[p++] = 0x41;
                buf[p++] = 0x50;
                buf[p++] = 0x45;
                buf[p++] = 0x32;
                buf[p++] = 0x2e;
                buf[p++] = 0x30;
                // Sub-block
                buf[p++] = 0x03;
                buf[p++] = 0x01;
                buf[p++] = loopCount & 0xff;
                buf[p++] = loopCount >> 8 & 0xff;
                buf[p++] = 0x00; // Terminator.
            }


            var ended = false;

            this.addFrame = function (x, y, w, h, indexedPixels, opts) {
                if (ended === true) {
                    --p;
                    ended = false;
                } // Un-end.

                opts = opts === undefined ? {} : opts;

                // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
                // canvas width/height, I imagine?
                if (x < 0 || y < 0 || x > 65535 || y > 65535)
                    throw "x/y invalid."

                if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
                    throw "Width/Height invalid."

                if (indexedPixels.length < w * h)
                    throw "Not enough pixels for the frame size.";

                var usingLocalPalette = true;
                var palette = opts.palette;
                if (palette === undefined || palette === null) {
                    usingLocalPalette = false;
                    palette = globalPalette;
                }

                if (palette === undefined || palette === null)
                    throw "Must supply either a local or global palette.";

                var numColors = checkPaletteAndNumColors(palette);

                // Compute the minCodeSize (power of 2), destroying numColors.
                var minCodeSize = 0;
                while (numColors >>= 1) ++minCodeSize;
                numColors = 1 << minCodeSize; // Now we can easily get it back.

                var delay = opts.delay === undefined ? 0 : opts.delay;

                // From the spec:
                //     0 -   No disposal specified. The decoder is
                //           not required to take any action.
                //     1 -   Do not dispose. The graphic is to be left
                //           in place.
                //     2 -   Restore to background color. The area used by the
                //           graphic must be restored to the background color.
                //     3 -   Restore to previous. The decoder is required to
                //           restore the area overwritten by the graphic with
                //           what was there prior to rendering the graphic.
                //  4-7 -    To be defined.
                // NOTE(deanm): Dispose background doesn't really work, apparently most
                // browsers ignore the background palette index and clear to transparency.
                var disposal = opts.disposal === undefined ? 0 : opts.disposal;
                if (disposal < 0 || disposal > 3) // 4-7 is reserved.
                    throw "Disposal out of range.";

                var useTransparency = false;
                var transparentIndex = 0;
                if (opts.transparent !== undefined && opts.transparent !== null) {
                    useTransparency = true;
                    transparentIndex = opts.transparent;
                    if (transparentIndex < 0 || transparentIndex >= numColors)
                        throw "Transparent color index.";
                }

                if (disposal !== 0 || useTransparency || delay !== 0) {
                    // - Graphics Control Extension
                    buf[p++] = 0x21;
                    buf[p++] = 0xf9; // Extension / Label.
                    buf[p++] = 4; // Byte size.

                    buf[p++] = disposal << 2 | (useTransparency === true ? 1 : 0);
                    buf[p++] = delay & 0xff;
                    buf[p++] = delay >> 8 & 0xff;
                    buf[p++] = transparentIndex; // Transparent color index.
                    buf[p++] = 0; // Block Terminator.
                }

                // - Image Descriptor
                buf[p++] = 0x2c; // Image Seperator.
                buf[p++] = x & 0xff;
                buf[p++] = x >> 8 & 0xff; // Left.
                buf[p++] = y & 0xff;
                buf[p++] = y >> 8 & 0xff; // Top.
                buf[p++] = w & 0xff;
                buf[p++] = w >> 8 & 0xff;
                buf[p++] = h & 0xff;
                buf[p++] = h >> 8 & 0xff;
                // NOTE: No sort flag (unused?).
                // TODO(deanm): Support interlace.
                buf[p++] = usingLocalPalette === true ? (0x80 | (minCodeSize - 1)) : 0;

                // - Local Color Table
                if (usingLocalPalette === true) {
                    for (var i = 0, il = palette.length; i < il; ++i) {
                        var rgb = palette[i];
                        buf[p++] = rgb >> 16 & 0xff;
                        buf[p++] = rgb >> 8 & 0xff;
                        buf[p++] = rgb & 0xff;
                    }
                }

                p = GifWriterOutputLZWCodeStream(
                    buf, p, minCodeSize < 2 ? 2 : minCodeSize, indexedPixels);
            };

            this.end = function () {
                if (ended === false) {
                    buf[p++] = 0x3b; // Trailer.
                    ended = true;
                }
                return p;
            };
        }

        // Main compression routine, palette indexes -> LZW code stream.
        // |indexStream| must have at least one entry.
        function GifWriterOutputLZWCodeStream(buf, p, minCodeSize, indexStream) {
            buf[p++] = minCodeSize;
            var curSubblock = p++; // Pointing at the length field.

            var clearCode = 1 << minCodeSize;
            var codeMask = clearCode - 1;
            var eoiCode = clearCode + 1;
            var nextCode = eoiCode + 1;

            var curCodeSize = minCodeSize + 1; // Number of bits per code.
            var curShift = 0;
            // We have at most 12-bit codes, so we should have to hold a max of 19
            // bits here (and then we would write out).
            var cur = 0;

            function emitBytesToBuffer(bitBlockSize) {
                while (curShift >= bitBlockSize) {
                    buf[p++] = cur & 0xff;
                    cur >>= 8;
                    curShift -= 8;
                    if (p === curSubblock + 256) { // Finished a subblock.
                        buf[curSubblock] = 255;
                        curSubblock = p++;
                    }
                }
            }

            function emitCode(c) {
                cur |= c << curShift;
                curShift += curCodeSize;
                emitBytesToBuffer(8);
            }

            // I am not an expert on the topic, and I don't want to write a thesis.
            // However, it is good to outline here the basic algorithm and the few data
            // structures and optimizations here that make this implementation fast.
            // The basic idea behind LZW is to build a table of previously seen runs
            // addressed by a short id (herein called output code).  All data is
            // referenced by a code, which represents one or more values from the
            // original input stream.  All input bytes can be referenced as the same
            // value as an output code.  So if you didn't want any compression, you
            // could more or less just output the original bytes as codes (there are
            // some details to this, but it is the idea).  In order to achieve
            // compression, values greater then the input range (codes can be up to
            // 12-bit while input only 8-bit) represent a sequence of previously seen
            // inputs.  The decompressor is able to build the same mapping while
            // decoding, so there is always a shared common knowledge between the
            // encoding and decoder, which is also important for "timing" aspects like
            // how to handle variable bit width code encoding.
            //
            // One obvious but very important consequence of the table system is there
            // is always a unique id (at most 12-bits) to map the runs.  'A' might be
            // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
            // can be used for an effecient lookup strategy for the code mapping.  We
            // need to know if a run has been seen before, and be able to map that run
            // to the output code.  Since we start with known unique ids (input bytes),
            // and then from those build more unique ids (table entries), we can
            // continue this chain (almost like a linked list) to always have small
            // integer values that represent the current byte chains in the encoder.
            // This means instead of tracking the input bytes (AAAABCD) to know our
            // current state, we can track the table entry for AAAABC (it is guaranteed
            // to exist by the nature of the algorithm) and the next character D.
            // Therefor the tuple of (table_entry, byte) is guaranteed to also be
            // unique.  This allows us to create a simple lookup key for mapping input
            // sequences to codes (table indices) without having to store or search
            // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
            // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
            // key.  This leads to a integer value at most 20-bits, which can always
            // fit in an SMI value and be used as a fast sparse array / object key.

            // Output code for the current contents of the index buffer.
            var ibCode = indexStream[0] & codeMask; // Load first input index.
            var codeTable = {}; // Key'd on our 20-bit "tuple".

            emitCode(clearCode); // Spec says first code should be a clear code.

            // First index already loaded, process the rest of the stream.
            for (var i = 1, il = indexStream.length; i < il; ++i) {
                var k = indexStream[i] & codeMask;
                var curKey = ibCode << 8 | k; // (prev, k) unique tuple.
                var curCode = codeTable[curKey]; // buffer + k.

                // Check if we have to create a new code table entry.
                if (curCode === undefined) { // We don't have buffer + k.
                    // Emit index buffer (without k).
                    // This is an inline version of emitCode, because this is the core
                    // writing routine of the compressor (and V8 cannot inline emitCode
                    // because it is a closure here in a different context).  Additionally
                    // we can call emit_byte_to_buffer less often, because we can have
                    // 30-bits (from our 31-bit signed SMI), and we know our codes will only
                    // be 12-bits, so can safely have 18-bits there without overflow.
                    // emitCode(ibCode);
                    cur |= ibCode << curShift;
                    curShift += curCodeSize;
                    while (curShift >= 8) {
                        buf[p++] = cur & 0xff;
                        cur >>= 8;
                        curShift -= 8;
                        if (p === curSubblock + 256) { // Finished a subblock.
                            buf[curSubblock] = 255;
                            curSubblock = p++;
                        }
                    }

                    if (nextCode === 4096) { // Table full, need a clear.
                        emitCode(clearCode);
                        nextCode = eoiCode + 1;
                        curCodeSize = minCodeSize + 1;
                        codeTable = {};
                    } else { // Table not full, insert a new entry.
                        // Increase our variable bit code sizes if necessary.  This is a bit
                        // tricky as it is based on "timing" between the encoding and
                        // decoder.  From the encoders perspective this should happen after
                        // we've already emitted the index buffer and are about to create the
                        // first table entry that would overflow our current code bit size.
                        if (nextCode >= (1 << curCodeSize)) ++curCodeSize;
                        codeTable[curKey] = nextCode++; // Insert into code table.
                    }

                    ibCode = k; // Index buffer to single input k.
                } else {
                    ibCode = curCode; // Index buffer to sequence in code table.
                }
            }

            emitCode(ibCode); // There will still be something in the index buffer.
            emitCode(eoiCode); // End Of Information.

            // Flush / finalize the sub-blocks stream to the buffer.
            emitBytesToBuffer(1);

            // Finish the sub-blocks, writing out any unfinished lengths and
            // terminating with a sub-block of length 0.  If we have already started
            // but not yet used a sub-block it can just become the terminator.
            if (curSubblock + 1 === p) { // Started but unused.
                buf[curSubblock] = 0;
            } else { // Started and used, write length and additional terminator block.
                buf[curSubblock] = p - curSubblock - 1;
                buf[p++] = 0;
            }
            return p;
        }

        function GifReader(buf) {
            var p = 0;

            // - Header (GIF87a or GIF89a).
            if (buf[p++] !== 0x47 || buf[p++] !== 0x49 || buf[p++] !== 0x46 ||
                buf[p++] !== 0x38 || (buf[p++] + 1 & 0xfd) !== 0x38 || buf[p++] !== 0x61) {
                throw "Invalid GIF 87a/89a header.";
            }

            // - Logical Screen Descriptor.
            var width = buf[p++] | buf[p++] << 8;
            var height = buf[p++] | buf[p++] << 8;
            var pf0 = buf[p++]; // <Packed Fields>.
            var globalPaletteFlag = pf0 >> 7;
            var numGlobalColorsPow2 = pf0 & 0x7;
            var nnumGlobalColors = 1 << (numGlobalColorsPow2 + 1);
            var background = buf[p++];
            // buf[p++]; // Pixel aspect ratio (unused?).
            p++;

            var globalpaletteOffset = null;

            if (globalPaletteFlag) {
                globalpaletteOffset = p;
                p += nnumGlobalColors * 3; // Seek past palette.
            }

            var noEof = true;

            var frames = [];

            var delay = 0;
            var transparentIndex = null;
            var disposal = 0; // 0 - No disposal specified.
            var loopCount = null;

            this.width = width;
            this.height = height;

            while (noEof && p < buf.length) {
                switch (buf[p++]) {
                    case 0x21: // Graphics Control Extension Block
                        switch (buf[p++]) {
                            case 0xff: // Application specific block
                                // Try if it's a Netscape block (with animation loop counter).
                                if (buf[p] !== 0x0b || // 21 FF already read, check block size.
                                    // NETSCAPE2.0
                                    (buf[p + 1] == 0x4e && buf[p + 2] == 0x45 && buf[p + 3] == 0x54 &&
                                    buf[p + 4] == 0x53 && buf[p + 5] == 0x43 && buf[p + 6] == 0x41 &&
                                    buf[p + 7] == 0x50 && buf[p + 8] == 0x45 && buf[p + 9] == 0x32 &&
                                    buf[p + 10] == 0x2e && buf[p + 11] == 0x30 &&
                                    // Sub-block
                                    buf[p + 12] == 0x03 && buf[p + 13] == 0x01 && buf[p + 16] == 0)) {
                                    p += 14;
                                    loopCount = buf[p++] | buf[p++] << 8;
                                    p++; // Skip terminator.
                                } else { // We don't know what it is, just try to get past it.
                                    p += 12;
                                    while (true) { // Seek through subblocks.
                                        var blockSize = buf[p++];
                                        if (blockSize === 0) break;
                                        p += blockSize;
                                    }
                                }
                                break;

                            case 0xf9: // Graphics Control Extension
                                if (buf[p++] !== 0x4 || buf[p + 4] !== 0)
                                    throw "Invalid graphics extension block.";
                                var pf1 = buf[p++];
                                delay = buf[p++] | buf[p++] << 8;
                                transparentIndex = buf[p++];
                                if ((pf1 & 1) === 0) transparentIndex = null;
                                disposal = pf1 >> 2 & 0x7;
                                p++; // Skip terminator.
                                break;

                            case 0xfe: // Comment Extension.
                                while (true) { // Seek through subblocks.
                                    blockSize = buf[p++];
                                    if (blockSize === 0) break;
                                    // console.log(buf.slice(p, p+blockSize).toString('ascii'));
                                    p += blockSize;
                                }
                                break;

                            default:
                                throw "Unknown graphic control label: 0x" + buf[p - 1].toString(16);
                        }
                        break;

                    case 0x2c: // Image Descriptor.
                        var x = buf[p++] | buf[p++] << 8;
                        var y = buf[p++] | buf[p++] << 8;
                        var w = buf[p++] | buf[p++] << 8;
                        var h = buf[p++] | buf[p++] << 8;
                        var pf2 = buf[p++];
                        var localPaletteFlag = pf2 >> 7;
                        var interlaceFlag = pf2 >> 6 & 1;
                        var numLocalColorsPow2 = pf2 & 0x7;
                        var numLocalColors = 1 << (numLocalColorsPow2 + 1);
                        var paletteOffset = globalpaletteOffset;
                        var hasLocalPalette = false;
                        if (localPaletteFlag) {
                            hasLocalPalette = true;
                            paletteOffset = p; // Override with local palette.
                            p += numLocalColors * 3; // Seek past palette.
                        }

                        var dataOffset = p;

                        p++; // codesize
                        while (true) {
                            blockSize = buf[p++];
                            if (blockSize === 0) break;
                            p += blockSize;
                        }

                        frames.push({
                            x: x,
                            y: y,
                            width: w,
                            height: h,
                            hasLocalPalette: hasLocalPalette,
                            paletteOffset: paletteOffset,
                            dataOffset: dataOffset,
                            data_length: p - dataOffset,
                            transparentIndex: transparentIndex,
                            interlaced: !!interlaceFlag,
                            delay: delay,
                            disposal: disposal
                        });
                        break;

                    case 0x3b: // Trailer Marker (end of file).
                        noEof = false;
                        break;

                    default:
                        throw "Unknown gif block: 0x" + buf[p - 1].toString(16);
                }
            }

            this.numFrames = function () {
                return frames.length;
            };

            this.loopCount = function () {
                return loopCount;
            };

            this.frameInfo = function (frameNum) {
                if (frameNum < 0 || frameNum >= frames.length)
                    throw "Frame index out of range.";
                return frames[frameNum];
            }

            this.decodeAndBlitFrameBGRA = function (frameNum, pixels) {
                var frame = this.frameInfo(frameNum);
                var numPixels = frame.width * frame.height;
                var indexStream = new Uint8Array(numPixels); // At most 8-bit indices.
                GifReaderLZWOutputIndexStream(
                    buf, frame.dataOffset, indexStream, numPixels);
                var paletteOffset = frame.paletteOffset;

                // NOTE(deanm): It seems to be much faster to compare index to 256 than
                // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
                // the profile, not sure if it's related to using a Uint8Array.
                var trans = frame.transparentIndex;
                if (trans === null) trans = 256;

                // We are possibly just blitting to a portion of the entire frame.
                // That is a subrect within the framerect, so the additional pixels
                // must be skipped over after we finished a scanline.
                var framewidth = frame.width;
                var framestride = width - framewidth;
                var xleft = framewidth; // Number of subrect pixels left in scanline.

                // Output indicies of the top left and bottom right corners of the subrect.
                var opbeg = ((frame.y * width) + frame.x) * 4;
                var opend = ((frame.y + frame.height) * width + frame.x) * 4;
                var op = opbeg;

                var scanstride = framestride * 4;

                // Use scanstride to skip past the rows when interlacing.  This is skipping
                // 7 rows for the first two passes, then 3 then 1.
                if (frame.interlaced === true) {
                    scanstride += width * 4 * 7; // Pass 1.
                }

                var interlaceskip = 8; // Tracking the row interval in the current pass.

                for (var i = 0, il = indexStream.length; i < il; ++i) {
                    var index = indexStream[i];

                    if (xleft === 0) { // Beginning of new scan line
                        op += scanstride;
                        xleft = framewidth;
                        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
                            scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                            // interlaceskip / 2 * 4 is interlaceskip << 1.
                            op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                            interlaceskip >>= 1;
                        }
                    }

                    if (index === trans) {
                        op += 4;
                    } else {
                        var r = buf[paletteOffset + index * 3];
                        var g = buf[paletteOffset + index * 3 + 1];
                        var b = buf[paletteOffset + index * 3 + 2];
                        pixels[op++] = b;
                        pixels[op++] = g;
                        pixels[op++] = r;
                        pixels[op++] = 255;
                    }
                    --xleft;
                }
            };

            // I will go to copy and paste hell one day...
            this.decodeAndBlitFrameRGBA = function (frameNum, pixels) {
                var frame = this.frameInfo(frameNum);
                var numPixels = frame.width * frame.height;
                var indexStream = new Uint8Array(numPixels); // At most 8-bit indices.
                GifReaderLZWOutputIndexStream(
                    buf, frame.dataOffset, indexStream, numPixels);
                var paletteOffset = frame.paletteOffset;

                // NOTE(deanm): It seems to be much faster to compare index to 256 than
                // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
                // the profile, not sure if it's related to using a Uint8Array.
                var trans = frame.transparentIndex;
                if (trans === null) trans = 256;

                // We are possibly just blitting to a portion of the entire frame.
                // That is a subrect within the framerect, so the additional pixels
                // must be skipped over after we finished a scanline.
                var framewidth = frame.width;
                var framestride = width - framewidth;
                var xleft = framewidth; // Number of subrect pixels left in scanline.

                // Output indicies of the top left and bottom right corners of the subrect.
                var opbeg = ((frame.y * width) + frame.x) * 4;
                var opend = ((frame.y + frame.height) * width + frame.x) * 4;
                var op = opbeg;

                var scanstride = framestride * 4;

                // Use scanstride to skip past the rows when interlacing.  This is skipping
                // 7 rows for the first two passes, then 3 then 1.
                if (frame.interlaced === true) {
                    scanstride += width * 4 * 7; // Pass 1.
                }

                var interlaceskip = 8; // Tracking the row interval in the current pass.

                for (var i = 0, il = indexStream.length; i < il; ++i) {
                    var index = indexStream[i];

                    if (xleft === 0) { // Beginning of new scan line
                        op += scanstride;
                        xleft = framewidth;
                        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
                            scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                            // interlaceskip / 2 * 4 is interlaceskip << 1.
                            op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                            interlaceskip >>= 1;
                        }
                    }

                    if (index === trans) {
                        op += 4;
                    } else {
                        var r = buf[paletteOffset + index * 3];
                        var g = buf[paletteOffset + index * 3 + 1];
                        var b = buf[paletteOffset + index * 3 + 2];
                        pixels[op++] = r;
                        pixels[op++] = g;
                        pixels[op++] = b;
                        pixels[op++] = 255;
                    }
                    --xleft;
                }
            };
        }

        function GifReaderLZWOutputIndexStream(codeStream, p, output, outputLength) {
            var minCodeSize = codeStream[p++];

            var clearCode = 1 << minCodeSize;
            var eoiCode = clearCode + 1;
            var nextCode = eoiCode + 1;

            var curCodeSize = minCodeSize + 1; // Number of bits per code.
            // NOTE: This shares the same name as the encoder, but has a different
            // meaning here.  Here this masks each code coming from the code stream.
            var codeMask = (1 << curCodeSize) - 1;
            var curShift = 0;
            var cur = 0;

            var op = 0; // Output pointer.

            var subblockSize = codeStream[p++];

            // TODO(deanm): Would using a TypedArray be any faster?  At least it would
            // solve the fast mode / backing store uncertainty.
            // var codeTable = Array(4096);
            var codeTable = new Int32Array(4096); // Can be signed, we only use 20 bits.

            var prevCode = null; // Track code-1.

            while (true) {
                // Read up to two bytes, making sure we always 12-bits for max sized code.
                while (curShift < 16) {
                    if (subblockSize === 0) break; // No more data to be read.

                    cur |= codeStream[p++] << curShift;
                    curShift += 8;

                    if (subblockSize === 1) { // Never let it get to 0 to hold logic above.
                        subblockSize = codeStream[p++]; // Next subblock.
                    } else {
                        --subblockSize;
                    }
                }

                // TODO(deanm): We should never really get here, we should have received
                // and EOI.
                if (curShift < curCodeSize)
                    break;

                var code = cur & codeMask;
                cur >>= curCodeSize;
                curShift -= curCodeSize;

                // TODO(deanm): Maybe should check that the first code was a clear code,
                // at least this is what you're supposed to do.  But actually our encoder
                // now doesn't emit a clear code first anyway.
                if (code === clearCode) {
                    // We don't actually have to clear the table.  This could be a good idea
                    // for greater error checking, but we don't really do any anyway.  We
                    // will just track it with nextCode and overwrite old entries.

                    nextCode = eoiCode + 1;
                    curCodeSize = minCodeSize + 1;
                    codeMask = (1 << curCodeSize) - 1;

                    // Don't update prevCode ?
                    prevCode = null;
                    continue;
                } else if (code === eoiCode) {
                    break;
                }

                // We have a similar situation as the decoder, where we want to store
                // variable length entries (code table entries), but we want to do in a
                // faster manner than an array of arrays.  The code below stores sort of a
                // linked list within the code table, and then "chases" through it to
                // construct the dictionary entries.  When a new entry is created, just the
                // last byte is stored, and the rest (prefix) of the entry is only
                // referenced by its table entry.  Then the code chases through the
                // prefixes until it reaches a single byte code.  We have to chase twice,
                // first to compute the length, and then to actually copy the data to the
                // output (backwards, since we know the length).  The alternative would be
                // storing something in an intermediate stack, but that doesn't make any
                // more sense.  I implemented an approach where it also stored the length
                // in the code table, although it's a bit tricky because you run out of
                // bits (12 + 12 + 8), but I didn't measure much improvements (the table
                // entries are generally not the long).  Even when I created benchmarks for
                // very long table entries the complexity did not seem worth it.
                // The code table stores the prefix entry in 12 bits and then the suffix
                // byte in 8 bits, so each entry is 20 bits.

                var chaseCode = code < nextCode ? code : prevCode;

                // Chase what we will output, either {CODE} or {CODE-1}.
                var chaseLength = 0;
                var chase = chaseCode;
                while (chase > clearCode) {
                    chase = codeTable[chase] >> 8;
                    ++chaseLength;
                }

                var k = chase;

                var opEnd = op + chaseLength + (chaseCode !== code ? 1 : 0);
                if (opEnd > outputLength) {
                    console.log("Warning, gif stream longer than expected.");
                    return;
                }

                // Already have the first byte from the chase, might as well write it fast.
                output[op++] = k;

                op += chaseLength;
                var b = op; // Track pointer, writing backwards.

                if (chaseCode !== code) // The case of emitting {CODE-1} + k.
                    output[op++] = k;

                chase = chaseCode;
                while (chaseLength--) {
                    chase = codeTable[chase];
                    output[--b] = chase & 0xff; // Write backwards.
                    chase >>= 8; // Pull down to the prefix code.
                }

                if (prevCode !== null && nextCode < 4096) {
                    codeTable[nextCode++] = prevCode << 8 | k;
                    // TODO(deanm): Figure out this clearing vs code growth logic better.  I
                    // have an feeling that it should just happen somewhere else, for now it
                    // is awkward between when we grow past the max and then hit a clear code.
                    // For now just check if we hit the max 12-bits (then a clear code should
                    // follow, also of course encoded in 12-bits).
                    if (nextCode >= codeMask + 1 && curCodeSize < 12) {
                        ++curCodeSize;
                        codeMask = codeMask << 1 | 1;
                    }
                }

                prevCode = code;
            }

            if (op !== outputLength) {
                console.log("Warning, gif stream shorter than expected.");
            }

            return output;
        }

        try {
            exports.GifWriter = GifWriter;
            exports.GifReader = GifReader
        } catch (e) {} // CommonJS.

    }, {}],
    2: [function (require, module, exports) {
        var Animator, GifReader, createBufferCanvas, decodeFrames, getCanvasElement, gifler, wrapXhrCallback,
            bind = function (fn, me) {
                return function () {
                    return fn.apply(me, arguments);
                };
            };

        GifReader = require('omggif').GifReader;


        /*
        Load and animate the gif.

        Arguments:
          url      - The URL of the gif to be loaded with an XMLHttpRequest.
          callback - Predicate argument than can be any one of the following:
                      - function - called with a new instance of Animator
                      - string - a query selector for a canvas element
                      - canvas - a canvas element
         */

        gifler = function (url) {
            var aync, xhr;
            xhr = window._XMLHttpRequest ? new _XMLHttpRequest() : new XMLHttpRequest();
            xhr.open('GET', url, aync = true);
            xhr.responseType = 'arraybuffer';
            return {
                xhr: xhr,
                get: function (callback) {
                    xhr.onload = wrapXhrCallback(callback);
                    xhr.send();
                    return this;
                },
                animate: function (selector) {
                    var canvas;
                    canvas = getCanvasElement(selector);
                    xhr.onload = wrapXhrCallback(function (animator) {
                        return animator.animateInCanvas(canvas);
                    });
                    xhr.send();
                    return this;
                },
                frames: function (selector, onDrawFrame, setCanvasDimesions) {
                    var canvas;
                    if (setCanvasDimesions == null) {
                        setCanvasDimesions = false;
                    }
                    canvas = getCanvasElement(selector);
                    xhr.onload = wrapXhrCallback(function (animator) {
                        animator.onDrawFrame = onDrawFrame;
                        return animator.animateInCanvas(canvas, setCanvasDimesions);
                    });
                    xhr.send();
                    return this;
                }
            };
        };

        wrapXhrCallback = function (callback) {
            return function (e) {
                return callback(new Animator(new GifReader(new Uint8Array(this.response))));
            };
        };

        getCanvasElement = function (selector) {
            var element, ref;
            if (typeof selector === 'string' && ((ref = (element = document.querySelector(selector))) != null ? ref.tagName : void 0) === 'CANVAS') {
                return element;
            } else if ((selector != null ? selector.tagName : void 0) === 'CANVAS') {
                return selector;
            } else {
                throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
            }
        };


        /*
        Creates a buffer canvas element since it is much faster to putImage than
        putImageData.

        The omggif library decodes the pixels into the full gif dimensions. We only
        need to store the frame dimensions, so we offset the putImageData call.
         */

        createBufferCanvas = function (frame, width, height) {
            var bufferCanvas, bufferContext, imageData;
            bufferCanvas = document.createElement('canvas');
            bufferContext = bufferCanvas.getContext('2d');
            bufferCanvas.width = frame.width;
            bufferCanvas.height = frame.height;
            imageData = bufferContext.createImageData(width, height);
            imageData.data.set(frame.pixels);
            bufferContext.putImageData(imageData, -frame.x, -frame.y);
            return bufferCanvas;
        };


        /*
        Decodes the pixels for each frame (decompressing and de-interlacing) into a
        Uint8ClampedArray, which is suitable for canvas ImageData.
         */

        decodeFrames = function (reader, frameIndex) {
            var j, ref, results;
            return (function () {
                results = [];
                for (var j = 0, ref = reader.numFrames(); ref >= 0 ? j < ref : j > ref; ref >= 0 ? j++ : j--) {
                    results.push(j);
                }
                return results;
            }).apply(this).map((function (_this) {
                return function (frameIndex) {
                    var frameInfo;
                    frameInfo = reader.frameInfo(frameIndex);
                    frameInfo.pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
                    reader.decodeAndBlitFrameRGBA(frameIndex, frameInfo.pixels);
                    return frameInfo;
                };
            })(this));
        };

        Animator = (function () {
            function Animator(_reader) {
                var ref;
                this._reader = _reader;
                this._advanceFrame = bind(this._advanceFrame, this);
                this._nextFrameRender = bind(this._nextFrameRender, this);
                this._nextFrame = bind(this._nextFrame, this);
                ref = this._reader;
                this.width = ref.width;
                this.height = ref.height;
                this._frames = decodeFrames(this._reader);
                this._loopCount = this._reader.loopCount();
                this._loops = 0;
                this._frameIndex = 0;
                this._running = false;
            }

            Animator.prototype.start = function () {
                this._lastTime = new Date().valueOf();
                this._delayCompensation = 0;
                this._running = true;
                setTimeout(this._nextFrame, 0);
                return this;
            };

            Animator.prototype.stop = function () {
                this._running = false;
                return this;
            };

            Animator.prototype.reset = function () {
                this._frameIndex = 0;
                this._loops = 0;
                return this;
            };

            Animator.prototype._nextFrame = function () {
                requestAnimationFrame(this._nextFrameRender);
            };

            Animator.prototype._nextFrameRender = function () {
                var frame, ref;
                if (!this._running) {
                    return;
                }
                frame = this._frames[this._frameIndex];
                if ((ref = this.onFrame) != null) {
                    ref.apply(this, [frame, this._frameIndex]);
                }
                return this._enqueueNextFrame();
            };

            Animator.prototype._advanceFrame = function () {
                this._frameIndex += 1;
                if (this._frameIndex >= this._frames.length) {
                    if (this._loopCount !== 0 && this._loopCount === this._loops) {
                        this.stop();
                    } else {
                        this._frameIndex = 0;
                        this._loops += 1;
                    }
                }
            };

            Animator.prototype._enqueueNextFrame = function () {
                var actualDelay, delta, frame, frameDelay;
                this._advanceFrame();
                while (this._running) {
                    frame = this._frames[this._frameIndex];
                    delta = new Date().valueOf() - this._lastTime;
                    this._lastTime += delta;
                    this._delayCompensation += delta;
                    frameDelay = frame.delay * 10;
                    actualDelay = frameDelay - this._delayCompensation;
                    this._delayCompensation -= frameDelay;
                    if (actualDelay < 0) {
                        this._advanceFrame();
                        continue;
                    } else {
                        setTimeout(this._nextFrame, actualDelay);
                        break;
                    }
                }
            };

            Animator.prototype.animateInCanvas = function (canvas, setDimension) {
                var ctx;
                if (setDimension == null) {
                    setDimension = true;
                }
                if (setDimension) {
                    canvas.width = this.width;
                    canvas.height = this.height;
                }
                ctx = canvas.getContext('2d');
                if (this.onDrawFrame == null) {
                    this.onDrawFrame = function (ctx, frame, i) {
                        return ctx.drawImage(frame.buffer, frame.x, frame.y);
                    };
                }
                if (this.onFrame == null) {
                    this.onFrame = (function (_this) {
                        return function (frame, i) {
                            var ref, saved;
                            if (frame.buffer == null) {
                                frame.buffer = createBufferCanvas(frame, _this.width, _this.height);
                            }
                            if (typeof _this.disposeFrame === "function") {
                                _this.disposeFrame();
                            }
                            switch (frame.disposal) {
                                case 2:
                                    _this.disposeFrame = function () {
                                        return ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    };
                                    break;
                                case 3:
                                    saved = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                    _this.disposeFrame = function () {
                                        return ctx.putImageData(saved, 0, 0);
                                    };
                                    break;
                                default:
                                    _this.disposeFrame = null;
                            }
                            return (ref = _this.onDrawFrame) != null ? ref.apply(_this, [ctx, frame, i]) : void 0;
                        };
                    })(this);
                }
                this.start();
                return this;
            };

            return Animator;

        })();

        gifler.Animator = Animator;

        gifler.decodeFrames = decodeFrames;

        gifler.createBufferCanvas = createBufferCanvas;

        if (typeof window !== "undefined" && window !== null) {
            window.gifler = gifler;
        }

        if (typeof module !== "undefined" && module !== null) {
            module.exports = gifler;
        }


    }, {
        "omggif": 1
    }]
}, {}, [2]);
