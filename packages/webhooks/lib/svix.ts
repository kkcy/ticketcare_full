import 'server-only';
import { Svix } from 'svix';
import { keys } from '../keys';

const svixToken = keys().SVIX_TOKEN;

export const send = (eventType: string, payload: object) => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);

  const orgId = '';
  // const { orgId } = await auth();

  // if (!orgId) {
  //   return;
  // }

  return svix.message.create(orgId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};

export const getAppPortal = () => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);
  const orgId = '';
  // const { orgId } = await auth();

  // if (!orgId) {
  //   return;
  // }

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
