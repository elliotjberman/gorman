import GormanReadOnly from './BaseGormans/GormanReadOnly';
import GormanWriteable from './BaseGormans/GormanWriteable';
import InternalJsonInterface from './Persistence/InternalJsonInterface';
import NedbInterface from './Persistence/NedbInterface';

const Persistence = {
    InternalJsonInterface,
    NedbInterface
}

export {
  GormanReadOnly,
  GormanWriteable,
  Persistence,
}
