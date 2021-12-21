import { Change } from "types/change";

declare type MessageData = {
  type: string;
  userId: string;
} & Record<PropertyKey, unknown>;

export class SocketManager {
  private socket: WebSocket | null = null;

  public connect(socketUrl: string) {
    this.socket = new WebSocket(
      `${socketUrl}?userId=${
        kintone.getLoginUser().id
      }&appId=${kintone.app.getId()}&recordId=${kintone.app.record.getId()}`
    );
  }

  public isConnected() {
    return Boolean(this.socket);
  }

  private send(type: string, data: Record<PropertyKey, unknown>) {
    if (this.socket?.readyState !== 1) {
      return;
    }
    this.socket.send(
      `{"action": "sendmessage", "data": ${JSON.stringify(
        JSON.stringify({
          type,
          userId: kintone.getLoginUser().id,
          ...data,
        })
      )}}`
    );
  }

  public change(change: Change) {
    this.send("change", { change });
  }

  public save() {
    this.send("save", {});
  }

  private onMessage(type: string, callback: (data: MessageData) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.addEventListener("message", ({ data }: { data: string }) => {
      const parsedData: MessageData = JSON.parse(data);
      if (parsedData.type === type) {
        callback(parsedData);
      }
    });
  }

  public onChange(
    callback: ({ userId, change }: { userId: string; change: Change }) => void
  ) {
    this.onMessage("change", ({ userId, change }) => {
      // TODO: type guard for Change
      // @ts-ignore
      callback({ userId, change });
    });
  }

  public onSave(callback: ({ userId }: { userId: string }) => void) {
    this.onMessage("save", ({ userId }) => {
      callback({ userId });
    });
  }

  public onConnect(callback: ({ userId }: { userId: string }) => void) {
    this.onMessage("connect", ({ userId }) => {
      callback({ userId });
    });
  }

  public onDisconnect(callback: ({ userId }: { userId: string }) => void) {
    this.onMessage("disconnect", ({ userId }) => {
      callback({ userId });
    });
  }
}
