/*eslint-env mocha */
/*eslint react/prop-types: 0*/
import assert from 'assert'
import expect from 'expect'
import React from 'react/addons'
import createHistory from 'history/lib/createMemoryHistory'
import execSteps from './execSteps'
import Router from '../Router'
import Route from '../Route'
import Link from '../Link'

const { click } = React.addons.TestUtils.Simulate

describe('A <Link>', function () {

  let node
  beforeEach(function () {
    node = document.createElement('div')
  })

  const Hello = React.createClass({
    render() {
      return <div>Hello {this.props.params.name}!</div>
    }
  })

  const Goodbye = React.createClass({
    render() {
      return <div>Goodbye</div>
    }
  })

  it('knows how to make its href', function () {
    const LinkWrapper = React.createClass({
      render() {
        return <Link to="/hello/michael" query={{the: 'query'}}>Link</Link>
      }
    })

    React.render((
      <Router history={createHistory('/')}>
        <Route path="/" component={LinkWrapper} />
      </Router>
    ), node, function () {
      const a = node.querySelector('a')
      expect(a.getAttribute('href')).toEqual('/hello/michael?the=query')
    })
  })

  // This test needs to be in its own file with beforeEach(resetHash).
  //
  //it('knows how to make its href with HashHistory', function () {
  //  const LinkWrapper = React.createClass({
  //    render() {
  //      return <Link to="/hello/michael" query={{the: 'query'}}>Link</Link>
  //    }
  //  })

  //  render((
  //    <Router history={new HashHistory}>
  //      <Route path="/" component={LinkWrapper} />
  //    </Router>
  //  ), node, function () {
  //    const a = node.querySelector('a')
  //    expect(a.getAttribute('href')).toEqual('#/hello/michael?the=query')
  //  })
  //})

  describe('with params', function () {
    const App = React.createClass({
      render() {
        return (
          <div>
            <Link to="/hello/michael" activeClassName="active">Michael</Link>
            <Link to="/hello/ryan" activeClassName="active">Ryan</Link>
          </div>
        )
      }
    })

    it('is active when its params match', function (done) {
      React.render((
        <Router history={createHistory('/hello/michael')}>
          <Route path="/" component={App}>
            <Route path="hello/:name" component={Hello} />
          </Route>
        </Router>
      ), node, function () {
        const a = node.querySelectorAll('a')[0]
        expect(a.className.trim()).toEqual('active')
        done()
      })
    })

    it('is not active when its params do not match', function (done) {
      React.render((
        <Router history={createHistory('/hello/michael')}>
          <Route path="/" component={App}>
            <Route path="hello/:name" component={Hello} />
          </Route>
        </Router>
      ), node, function () {
        const a = node.querySelectorAll('a')[1]
        expect(a.className.trim()).toEqual('')
        done()
      })
    })
  })

  describe('when its route is active and className is empty', function () {
    it('it shouldn\'t have an active class', function (done) {
      const LinkWrapper = React.createClass({
        render() {
          return (
            <div>
              <Link to="/hello" className="dontKillMe" activeClassName="">Link</Link>
              {this.props.children}
            </div>
          )
        }
      })

      let a
      const steps = [
        function () {
          a = node.querySelector('a')
          expect(a.className).toEqual('dontKillMe')
          this.history.pushState(null, '/hello')
        },
        function () {
          expect(a.className).toEqual('dontKillMe')
        }
      ]

      const execNextStep = execSteps(steps, done)

      React.render((
        <Router history={createHistory('/goodbye')} onUpdate={execNextStep}>
          <Route path="/" component={LinkWrapper}>
            <Route path="goodbye" component={Goodbye} />
            <Route path="hello" component={Hello} />
          </Route>
        </Router>
      ), node, execNextStep)
    })
  })

  describe('when its route is active', function () {
    it.skip('has its activeClassName', function (done) {
      const LinkWrapper = React.createClass({
        render() {
          return (
            <div>
              <Link to="/hello" className="dontKillMe" activeClassName="highlight">Link</Link>
              {this.props.children}
            </div>
          )
        }
      })

      let a
      const steps = [
        function () {
          a = node.querySelector('a')
          expect(a.className).toEqual('dontKillMe')
          this.history.pushState(null, '/hello')
        },
        function () {
          expect(a.className).toEqual('dontKillMe highlight')
        }
      ]

      const execNextStep = execSteps(steps, done)

      React.render((
        <Router history={createHistory('/goodbye')} onUpdate={execNextStep}>
          <Route path="/" component={LinkWrapper}>
            <Route path="goodbye" component={Goodbye} />
            <Route path="hello" component={Hello} />
          </Route>
        </Router>
      ), node, execNextStep)
    })

    it.skip('has its activeStyle', function (done) {
      const LinkWrapper = React.createClass({
        render() {
          return (
            <div>
              <Link to="/hello" style={{ color: 'white' }} activeStyle={{ color: 'red' }}>Link</Link>
              {this.props.children}
            </div>
          )
        }
      })

      let a
      const steps = [
        function () {
          a = node.querySelector('a')
          expect(a.style.color).toEqual('white')
          this.history.pushState(null, '/hello')
        },
        function () {
          expect(a.style.color).toEqual('red')
        }
      ]

      const execNextStep = execSteps(steps, done)

      React.render((
        <Router history={createHistory("/goodbye")} onUpdate={execNextStep}>
          <Route path="/" component={LinkWrapper}>
            <Route path="hello" component={Hello} />
            <Route path="goodbye" component={Goodbye} />
          </Route>
        </Router>
      ), node, execNextStep)
    })
  })

  describe('when route changes', function() {
    it.skip('changes active state', function(done) {
      const LinkWrapper = React.createClass({
        shouldComponentUpdate() {
          return false
        },
        render() {
          return (
            <div>
              <Link to="/hello">Link</Link>
              {this.props.children}
            </div>
          )
        }
      })

      let a
      const steps = [
        function () {
          a = node.querySelector('a')
          expect(a.className).toEqual('')
          this.history.pushState(null, '/hello')
        },
        function () {
          expect(a.className).toEqual('active')
        }
      ]

      const execNextStep = execSteps(steps, done)

      React.render((
        <Router history={createHistory('/goodbye')} onUpdate={execNextStep}>
          <Route path="/" component={LinkWrapper}>
            <Route path="goodbye" component={Goodbye} />
            <Route path="hello" component={Hello} />
          </Route>
        </Router>
      ), node, execNextStep)
    })
  })

  describe('when clicked', function () {
    it('calls a user defined click handler', function (done) {
      const LinkWrapper = React.createClass({
        handleClick(event) {
          event.preventDefault()
          assert.ok(true)
          done()
        },
        render() {
          return <Link to="/hello" onClick={this.handleClick}>Link</Link>
        }
      })

      React.render((
        <Router history={createHistory('/')}>
          <Route path="/" component={LinkWrapper} />
          <Route path="/hello" component={Hello} />
        </Router>
      ), node, () => {
        click(node.querySelector('a'))
      })
    })

    it('transitions to the correct route', function (done) {
      const LinkWrapper = React.createClass({
        handleClick() {
          // just here to make sure click handlers don't prevent it from happening
        },
        render() {
          return <Link to="/hello" onClick={this.handleClick}>Link</Link>
        }
      })

      const steps = [
        function () {
          click(node.querySelector('a'), { button: 0 })
        },
        function () {
          expect(node.innerHTML).toMatch(/Hello/)
        }
      ]

      const execNextStep = execSteps(steps, done)

      React.render((
        <Router history={createHistory('/')} onUpdate={execNextStep}>
          <Route path="/" component={LinkWrapper} />
          <Route path="/hello" component={Hello} />
        </Router>
      ), node, execNextStep)
    })
  })

})
