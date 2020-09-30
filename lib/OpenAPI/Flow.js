const lodash = require('lodash');
const types = require('../type');

const PATH_TABLE = {
  path: 'params',
  query: 'request.query',
  header: 'request.headers',
  cookie: 'cookies',
};

const TYPE_TABLE = {
  integer: types.int,
  number: types.num,
  boolean: types.bool,
  string: types.string,
  array: types.arr,
  object: types.object, // XXX: not parse string
};

const PARAM_FIELD = [
  'name', 'in', 'description', 'required', 'deprecated', 'allowEmptyValue',
  'schema', 'style', 'explode', 'allowReserved', 'example', 'examples',
];

const PARAM_SCHEMA_FIELD = [
  'type', 'format', 'enum', 'default', 'nullable',
  'minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', 'multipleOf',
  'minLength', 'maxLength', 'pattern',
  'minItems', 'maxItems', 'uniqueItems', 'items',
  'minProperties', 'maxProperties', 'properties', 'additionalProperties',
  // allOf, oneOf, anyOf, not
];

const BODY_SCHEMA_FIELD = [...PARAM_SCHEMA_FIELD, 'description', 'deprecated', 'example'];

// ----------------------------------------------------------------------------
function typeSchema(arg) {
  if (arg === undefined) {
    return undefined;
  }
  if (lodash.isPlainObject(arg)) {
    return { type: 'object', properties: lodash.mapValues(arg, typeSchema) };
  }
  if (Array.isArray(arg)) {
    return { type: 'array', items: typeSchema(lodash.first(arg)) || {} };
  }
  if (Reflect.has(TYPE_TABLE, arg)) {
    return { type: arg };
  }
  return arg;
}

function formatParameters(object) {
  return lodash.map(object, ({ type, ...entry }, name) => {
    const schema = { ...typeSchema(type), ...lodash.pick(entry, PARAM_SCHEMA_FIELD) };
    return lodash.pick({ name, schema, ...entry }, PARAM_FIELD);
  });
}

function formatRequestBody(object) {
  const required = [];
  const properties = lodash.mapValues(object, ({ type, ...entry }, name) => {
    if (entry.required) {
      required.push(name);
    }
    return { ...typeSchema(type), ...lodash.pick(entry, BODY_SCHEMA_FIELD) };
  });

  const schema = {
    type: 'object',
    properties,
    required: lodash.isEmpty(required) ? undefined : required,
  };

  return lodash.isEmpty(object) ? undefined : {
    content: {
      'application/json': { schema },
    },
  };
}

function formatResponses(schema) {
  return {
    200: {
      description: '',
      content: {
        'application/json': {
          schema: typeSchema(schema),
        },
      },
    },
    500: {
      description: '',
      content: {
        'application/json': {
          schema: typeSchema({
            code: 'integer',
            message: 'string',
          }),
        },
      },
    },
  };
}

function pickParameter(input) {
  return (object) => lodash.mapValues(input, (entry, key) => {
    const path = PATH_TABLE[entry.in] || 'request.body';
    const value = lodash.get(object, `${path}.${key}`);
    const schema = typeSchema(entry.type);
    return value === undefined ? value : TYPE_TABLE[schema.type](value);
  });
}

function pickBody(schema) {
  if (lodash.isPlainObject(schema)) {
    const map = lodash.mapValues(schema, pickBody);
    return o => lodash.mapValues(map, (f, k) => f(lodash.get(o, k)));
  }

  if (Array.isArray(schema)) {
    const each = pickBody(lodash.first(schema));
    return a => lodash.map(a, each);
  }

  return v => v;
}

// ----------------------------------------------------------------------------
class Flow {
  constructor({ input, output, ...rest }) {
    this.object = {
      parameters: formatParameters(lodash.pickBy(input, entry => PATH_TABLE[entry.in])),
      requestBody: formatRequestBody(lodash.pickBy(input, entry => !PATH_TABLE[entry.in])),
      responses: formatResponses(output),
      ...rest,
    };

    this.input = pickParameter(input);
    this.output = pickBody(output);
  }

  async call(ctx, arg, next) {
    let body;

    try {
      body = this.output(await next(this.input(arg)));
      ctx.status = 200;
    } catch (e) {
      body = e;
      ctx.status = 500;
    }

    return body;
  }
}

module.exports = Flow;
