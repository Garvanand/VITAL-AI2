import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  email: string;
  password: string;
  name?: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onNameChange?: (name: string) => void;
  isSignUp?: boolean;
}

export function AuthenticationForm({
  email,
  onEmailChange,
  onPasswordChange,
  password,
  name,
  onNameChange,
  isSignUp = false,
}: Props) {
  return (
    <>
      {isSignUp && onNameChange && (
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
          <Label className={'text-muted-foreground leading-5'} htmlFor="name">
            Full Name
          </Label>
          <Input
            className={'border-border rounded-xs'}
            type="text"
            id="name"
            autoComplete={'name'}
            value={name || ''}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
      )}
      <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
        <Label className={'text-muted-foreground leading-5'} htmlFor="email">
          Email address
        </Label>
        <Input
          className={'border-border rounded-xs'}
          type="email"
          id="email"
          autoComplete={'username'}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className={'text-muted-foreground leading-5'} htmlFor="password">
          Password
        </Label>
        <Input
          className={'border-border rounded-xs'}
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>
    </>
  );
}
