const picker = require('../');
const assert = require('koaflow-test/assert');

let ret;
let func;

const user = {
  name: 'Tom',
  age: 22,
  adult: true,
  cash: null,
  birthday: new Date('2000-01-01'),
  file: Buffer.from('62E2'),
  education: [
    {
      city: 'Shanghai',
      school: 'No.1 high school',
      score: null,
    },
    {
      city: 'Beijing',
      school: 'Beijing University',
      gpa: 100.0,
    },
  ],
  parent: {
    mom: 'Anny',
    dad: 'King',
  },
};

test('pick array to long', () => {
  try {
    ret = picker([Number, Boolean]);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof picker.PickerError);
});

test('pick any', () => {
  func = picker({
    name: true,
  });
  ret = func(user);

  assert(Object.keys(ret).length, 1);
  assert(ret, { name: 'Tom' });
});

test('drop any', () => {
  func = picker({
    name: false,
  });
  ret = func(user);

  assert(Object.keys(ret).length, 0);
});

test('pick null', () => {
  func = picker(null);
  ret = func(user);
  assert(ret, undefined);
});

test('pick string', () => {
  func = picker(String);
  ret = func(user);
  assert(ret, undefined);
});

test('pick boolean', () => {
  func = picker(Boolean);
  ret = func(user);
  assert(ret, undefined);
});

test('pick number', () => {
  func = picker(Number);
  ret = func(user);
  assert(ret, undefined);
});

test('pick date', () => {
  func = picker(Date);
  ret = func(user);
  assert(ret, undefined);
});

test('pick buffer', () => {
  func = picker(Buffer);
  ret = func(user);
  assert(ret, undefined);
});

test('pick array', () => {
  func = picker(Array);
  ret = func(user);
  assert(ret, undefined);
});

test('pick object', () => {
  func = picker(Object);
  ret = func(user);
  assert(ret, user);
});

test('pick object nest', () => {
  func = picker({
    name: String,
    age: Number,
    adult: Boolean,
    birthday: Date,
    cash: null,
    file: Buffer,
  });
  ret = func(user);

  assert(Object.keys(ret).length, 6);
  assert(ret, {
    name: 'Tom',
    age: 22,
    adult: true,
    birthday: new Date('2000-01-01'),
    cash: null,
    file: Buffer.from('62E2'),
  });
});

test('pick container', () => {
  func = picker({
    name: Object,
    age: [Number],
    adult: {},
    education: Array,
  });
  ret = func(user);

  assert(ret, {
    name: undefined,
    age: undefined,
    adult: undefined,
    education: [Boolean, Boolean, undefined],
  });
});

test('pick array nest', () => {
  func = picker({
    education: [
      {
        city: String,
      },
    ],
  });
  ret = func(user);

  assert(Object.keys(ret.education).length, 2);
});

test('pick function', () => {
  func = picker({
    education: v => v.length === 2 ? [{ city: String }] : false,
  });
  ret = func(user);

  assert(ret.education, [
    { city: 'Shanghai', school: undefined },
    { city: 'Beijing', school: undefined },
  ]);
});

test('pick function false', () => {
  func = picker({
    education: v => v.length === 1 ? [{ city: String }] : false,
  });
  ret = func(user);
  assert(ret.education, undefined);
});

afterEach(() => {
  console.log(ret);
  ret = undefined;
});
