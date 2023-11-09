import {
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  TUser,
  TLoginResponse,
  setTokenHeader,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  TLoginUser,
} from 'librechat-data-provider';
import { TAuthConfig, TUserContext, TAuthContext, TResError } from '~/common';
import { useNavigate } from 'react-router-dom';
import useTimeout from './useTimeout';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';


const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthContextProvider = ({
  authConfig,
  children,
}: {
  authConfig?: TAuthConfig;
  children: ReactNode;
}) => {
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

  const doSetError = useTimeout({ callback: (error) => setError(error as string | undefined) });

  const setUserContext = useCallback(
      (userContext: TUserContext) => {
          const { user } = userContext;
          if (user) {
              setUser(user);
          }
          setIsAuthenticated(true);
      },
      [],
  );


  useEffect(() => {
    const idToken = Cookies.get('ws_id_token');
    if (idToken) {
      const user = get_user_info(idToken);
      setUser(user);
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const get_user_info = (id_token: string) => {
      const claims = jwtDecode(id_token);
      return {
          user_id: parseInt(claims.sub.split('@')[0]),
          name: claims.name,
          email: claims.email,
          last_name: claims.family_name,
          first_name: claims.given_name,
      };
  };

  // Make the provider update only when it should
  const memoedValue = useMemo(
      () => ({
          user,
          isAuthenticated,
          error,
      }),
      [user, error, isAuthenticated],
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
      throw new Error('useAuthContext should be used inside AuthProvider');
  }

  return context;
};

export { AuthContextProvider, useAuthContext };
