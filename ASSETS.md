# V1 image sources and treatment

All served files are self-hosted. Originals and generated intermediates outside the checkout are not production dependencies.

| File under v3-src/public/media/v1 | Origin | Treatment |
| --- | --- | --- |
| hero.webp | [Fab / Pexels 29571011](https://www.pexels.com/photo/fashionable-man-in-black-turtleneck-on-urban-street-29571011/) | Real editorial photograph; proportional resize, WebP compression and CSS crop. No implied endorsement. [Pexels license](https://www.pexels.com/license/). |
| builds.webp | Built-in image_gen | Generated four-panel sheet, slim/average/athletic/broader; consistent clothing, pose and lighting. Not actual customers or product photography. |
| fit-problems.webp | Built-in image_gen | Generated four-panel sheet, tight thighs/waist gap/loose lower legs/short hems. A targeted edit made the rear waistband gap clearly visible. |
| fit-guide.webp | [Tokunori 501xx-front](https://commons.wikimedia.org/wiki/File:501xx-front.jpg) and [501xx-back](https://commons.wikimedia.org/wiki/File:501xx-back.jpg) | AI background replacement and diptych composition, proportional scaling, WebP compression, CSS/SVG crops and separate UI measurement markers. |

## Guide license

Tokunori's photographs and FitCo's edited guide composite are distributed under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This image license does not change the license of unrelated site code. Both source pages identify Tokunori and CC BY-SA 4.0, verified 11 September 2026. Visible attribution, source links, license link and changes are on /about/index.html#image-credits, linked directly under the homepage guide.

The generative background edit preserved the garment's broad structure, but changed some denim microtexture and wash contrast. Do not present the edited image as a verified SKU photo or measurement record.

## Generated assets

Created with the built-in image_gen tool, not an external API. Prompts are preserved in V1-IMAGE-PROMPTS.json. The quiz discloses generated examples beneath the relevant choices. Slim versus average differences are intentionally restrained. No images are used to infer a visitor's body from a photo.

The education card crops reference a single 1448 by 1086 diptych: front in the left half, back in the right half. Each measurement marker shares the image's coordinate system. Build and problem sheets each have four equal panels (1774 by 887); CSS isolates each quarter without raster distortion.

Existing category and retailer product photography was retained. This pass does not newly verify those products, current prices, source rights, or inventory. Prices remain a dated catalog snapshot.
# Interactive hero, September 12, 2026

- `media/v1/straight-walk.mp4` and its source mirror in `v3-src/public/media/v1/`: user-supplied animated street photograph, uploaded as `The-man-continues-walking-forward-at-a-s.mp4`. Re-encoded to H.264 with fast-start, no audio; original motion and duration retained. 510 × 682, approximately five seconds.
- `straight-poster.webp`: first frame extracted from that supplied video. Used before playback, for reduced-motion preferences, and while inspecting fit markers.
- Straight is the user's chosen cut classification for this illustrative media; this is not verified product measurement evidence. Hotspot copy explains what to look for, rather than claiming measured garment properties.
- Slim and Relaxed now use their own supplied still/video pairs in `media/slim.*` and `media/relaxed.*`; neither reuses the Straight media.

# Targeted polish assets, September 13, 2026

- `images/quiz-categories/{jeans,chinos,technical}.webp` and their `v3-src/public` mirrors: generated in Higgsfield as a coordinated, product-only flat-lay set. They are category examples, not photos of catalog SKUs. The source outputs were inspected before web optimization; each production file is a 900 × 900 WebP.
- `media/v1/method-proportions.webp`: optimized from the user-supplied Higgsfield image `IMG_1774.jpeg`. Used only to illustrate how upper-leg room affects fit.
- `media/v1/method-matches.webp`: optimized from the user-supplied Higgsfield image `IMG_1771.jpeg`. Used only to illustrate comparison between trouser shapes.
- `images/quiz-leg-shapes/*.jpg` and their `v3-src/public` mirrors: the user-approved Question 5 illustration set from September 13. The same visual language now carries into active recommendation and comparison surfaces.
- All generated or illustrative garments explain categories and shapes. They are not measured products, customer photos, endorsements, or evidence that a particular retailer item will fit.
