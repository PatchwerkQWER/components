## j-Animation (BETA)

This component can animate elements with `.animation` class.

__Configuration__:

- `style {Number}` style of animation
	- `1` opacity
	- `2` __default__ scale from big to normal
	- `3` scale from small to normal
	- `4` rotation Z
	- `5` changing of X position
	- `6` changing of Y position
- `delay {Number}` delay between animation (default: `500`)
- `init {Number}` initialization delay (default: `1000`)
- `cleaner {Number`} delay for cleaner of animation classes (default: `1000` is multipled by count of elements)
- `together {Boolean}` all elements will be animated together (default: `false`)

### Element configuration

Element configuration can be defined in `data-animation="delay:100;order:3"` attribute and it's optional:

- `noanimation {Boolean}` disables animation for this element (only removes `.animation` class)
- `delay {Number}` animation delay (default: `config.delay`)
- `order {Number}` animation order index, must start with `1` ... (elements with same order will be displayed together)

### Author

- Peter Širka <petersirka@gmail.com>
- [License](https://www.totaljs.com/license/)