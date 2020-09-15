import { Cacher } from './storage'

/* TYPES */

import type { TemplateFunction } from './compile'

/* END TYPES */

/**
 * Eta's template storage
 *
 * Stores partials and cached templates
 */

var templates = new Cacher<TemplateFunction>({})

export { templates }
