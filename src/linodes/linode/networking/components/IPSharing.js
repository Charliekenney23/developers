import React, { PropTypes, Component } from 'react';

import _ from 'lodash';
import { Card } from '~/components/cards';
import SecondaryTable from '~/components/SecondaryTable';
import { Form, FormGroup, SubmitButton, Checkbox } from '~/components/form';
import { Link } from '~/components/Link';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setShared } from '~/api/linodes';

export default class IPSharing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: {},
      errors: {},
      saving: false,
    };

    this.componentWillReceiveProps(props, undefined, (state) => {
      this.state = { ...this.state, ...state };
    });
  }

  componentWillReceiveProps(nextProps, nextState, setState) {
    const { linode } = nextProps;
    const checked = {};
    (linode._ips.ipv4.shared || []).forEach(ip => {
      checked[ip.address] = true;
    });
    (setState || this.setState)({ checked });
  }

  onSubmit = async () => {
    const { dispatch, linode } = this.props;
    const { checked } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      const sharedIps = Object.keys(_.pickBy(checked, checked => checked));
      await dispatch(setShared(linode.id, sharedIps));
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ saving: false });
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  formatRows() {
    const { linodes, linode: thisLinode } = this.props;
    const { checked } = this.state;

    let rows = [];
    linodes.forEach(linode => {
      if (linode.id === thisLinode.id) {
        return;
      }

      const shareableIps = linode._ips.ipv4.public;
      rows = rows.concat(shareableIps.map(ip => ({
        address: (
          <div>
            <Checkbox
              onChange={() => this.setState({
                checked: { ...checked, [ip.address]: !checked[ip.address] } })}
              id={ip.address}
              checked={checked[ip.address] || false}
              label={`${ip.address}${ip.rdns ? ` (${ip.rdns})` : ''}`}
            />
          </div>
        ),
        linode: <Link to={`/linodes/${linode.label}`}>{linode.label}</Link>,
      })));
    });

    return rows;
  }

  render() {
    const { errors, saving } = this.state;

    const rows = this.formatRows();

    return (
      <Card title="IP Sharing">
        <p>
          <small>
            The selected IP addresses can be brought up by this Linode if the original Linode's
            host becomes unavailable.
          </small>
        </p>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <SecondaryTable
              labels={['IP Address', 'Linode', '']}
              keys={['address', 'linode', '']}
              rows={rows}
            />
          </FormGroup>
          <SubmitButton disabled={saving}>Save</SubmitButton>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

IPSharing.propTypes = {
  linode: PropTypes.object.isRequired,
  linodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};
