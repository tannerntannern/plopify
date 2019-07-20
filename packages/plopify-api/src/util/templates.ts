import * as hbs from 'handlebars';

/**
 * Simple function that uses handlebars to render a template string with data.
 */
export const renderString = (templateString: string, data: {[key: string]: any}): string => {
	return hbs.compile(templateString)(data);
};
