import "regenerator-runtime/runtime";
import GormanReadOnly from './BaseGormans/GormanReadOnly';
import GormanWriteable from './BaseGormans/GormanWriteable';
import InternalJsonInterface from './Persistence/InternalJsonInterface';

const Persistence = {
    InternalJsonInterface
}

export {
  GormanReadOnly,
  GormanWriteable,
  Persistence,
}
