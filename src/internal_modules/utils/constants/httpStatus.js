/**
 * Reed here before use
 * https://www.restapitutorial.com/httpstatuscodes.html
 */

module.exports = {
	/*************************
	 *      2xx Success      *
	 *************************/

	OK: 200, //                          * Success
	UPDATED: 200, //                     * PUT/PATCH Requests
	CREATED: 201, //                     * Create new entity
	ACCEPTED: 202,
	NO_CONTENT: 204,
	DELETED: 204, //                     * DELETE requests
	PARTIAL_CONTENT: 206,
	ALREADY_REPORTED: 208, //			 *WebDAV

	/*************************
	 *   4xx Client Error    *
	 *************************/

	BAD_REQUEST: 400, //                 * A bad request
	UNAUTHORIZED: 401, //                *
	FORBIDDEN: 403, //                   *
	NOT_FOUND: 404, //                   * Endpoint not found
	NOT_ACCEPTABLE: 406,
	REQUEST_TIMEOUT: 408, //             *
	CONFLICT: 409,
	PRECONDITION_FAILED: 412,
	REQUEST_ENTITY_TOO_LARGE: 413,
	REQUEST_URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	REQUESTED_RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	ENHANCE_YOUR_CALM: 420,
	UNPROCESSABLE_ENTITY: 422, //		*WebDAV
	LOCKED: 423, //						*WebDAV
	FAILED_DEPENDENCY: 424, //			*WebDAV
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	NO_RESPONSE: 444,
	RETRY_WITH: 449,
	BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS: 450,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	CLIENT_CLOSED_REQUEST: 499,
	I_AM_A_TEAPOT: 418,

	/*************************
	 *   5xx Server Error    *
	 *************************/

	INTERNAL_SERVER_ERROR: 500, //       * Server error
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	VARIANT_ALSO_NEGOTIATES: 506,
	INSUFFICIENT_STORAGE: 507, //		*WebDAV
	LOOP_DETECTED: 508, //				*WebDAV
	BANDWIDTH_LIMIT_EXCEEDED: 509,
	NOT_EXTENDED: 510,
	NETWORK_AUTHENTICATION_REQUIRED: 511,
	NETWORK_READ_TIMEOUT_ERROR: 598,
	NETWORK_CONNECT_TIMEOUT_ERROR: 599,
};
